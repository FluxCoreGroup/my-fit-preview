-- Delete all empty conversations (conversations with no messages)
DELETE FROM conversations 
WHERE id IN (
  SELECT c.id 
  FROM conversations c
  LEFT JOIN chat_messages cm ON cm.conversation_id = c.id
  GROUP BY c.id
  HAVING COUNT(cm.id) = 0
);