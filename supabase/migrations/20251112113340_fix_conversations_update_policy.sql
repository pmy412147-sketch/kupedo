/*
  # Add UPDATE policy for conversations table
  
  Allows users to update last_message_at timestamp in their conversations.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' 
    AND policyname = 'Users can update their conversations'
  ) THEN
    CREATE POLICY "Users can update their conversations"
      ON conversations
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
      WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
  END IF;
END $$;
