import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const Stripe = (await import("npm:stripe@14.11.0")).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.user_id;
      const packageId = session.metadata?.package_id;
      const coins = parseInt(session.metadata?.coins || "0");
      const bonusCoins = parseInt(session.metadata?.bonus_coins || "0");
      const totalCoins = coins + bonusCoins;
      const price = session.amount_total ? session.amount_total / 100 : 0;

      if (!userId || !packageId || !coins) {
        console.error("Missing required metadata:", session.metadata);
        return new Response(
          JSON.stringify({ error: "Invalid metadata" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { createClient } = await import("npm:@supabase/supabase-js@2.38.4");
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: updateError } = await supabase.rpc("add_user_coins", {
        p_user_id: userId,
        p_amount: totalCoins,
      });

      if (updateError) {
        console.error("Error updating user coins:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update coins" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error: transactionError } = await supabase
        .from("coin_transactions")
        .insert({
          user_id: userId,
          amount: totalCoins,
          transaction_type: "purchase",
          reference_id: packageId,
          description: `Purchased ${coins} coins${bonusCoins > 0 ? ` + ${bonusCoins} bonus` : ""} for €${price.toFixed(2)}`,
          metadata: {
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
            price: price,
            coins: coins,
            bonus_coins: bonusCoins,
          },
        });

      if (transactionError) {
        console.error("Error logging transaction:", transactionError);
      }

      console.log(`Successfully added ${totalCoins} coins to user ${userId}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});