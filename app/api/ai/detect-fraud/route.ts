import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

interface FraudAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedPatterns: string[];
  suspiciousIndicators: string[];
  reasoning: string;
  recommendations: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adData, adId } = body;

    if (!adData) {
      return NextResponse.json(
        { error: 'adData is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = `
Analyzuj tento inzerát na podozrivé vzory a potenciálny podvod.

Údaje inzerátu:
${JSON.stringify(adData, null, 2)}

Vyhodnoť nasledovné:
1. Rizikové skóre (0-100, kde 100 = vysoké riziko)
2. Úroveň rizika (low/medium/high/critical)
3. Detekované podozrivé vzory
4. Konkrétne podozrivé indikátory
5. Odôvodnenie hodnotenia
6. Odporúčania pre admina

Pozor na:
- Nerealisticky nízke ceny
- Zlá gramatika alebo preklepy
- Chybajúce detaily
- Požiadavky na platbu mimo platformy
- Podozrivé kontaktné údaje
- Nesúlad medzi opisom a fotografiami
- Urgentné požiadavky na okamžitú akciu

Vráť výsledok v slovenčine v JSON formáte.
`;

    const schema = JSON.stringify({
      riskScore: 0,
      riskLevel: 'low',
      detectedPatterns: ['vzor1'],
      suspiciousIndicators: ['indikátor1'],
      reasoning: 'odôvodnenie',
      recommendations: ['odporúčanie1'],
    });

    const analysis = await generateStructuredOutput<FraudAnalysis>(prompt, schema);

    const endTime = Date.now();

    if (adId) {
      const flagged = analysis.riskLevel === 'high' || analysis.riskLevel === 'critical';

      await supabase.from('ai_fraud_detection').insert({
        ad_id: adId,
        risk_score: analysis.riskScore,
        risk_level: analysis.riskLevel,
        detected_patterns: analysis.detectedPatterns,
        suspicious_indicators: analysis.suspiciousIndicators,
        flagged_for_review: flagged,
        review_status: flagged ? 'pending' : 'approved',
      });
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: adData.user_id || null,
      feature_type: 'fraud_detection',
      response_time_ms: endTime - startTime,
      success: true,
    });

    return NextResponse.json({
      analysis,
      generationTime: endTime - startTime,
    });
  } catch (error: any) {
    console.error('Error detecting fraud:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to detect fraud' },
      { status: 500 }
    );
  }
}
