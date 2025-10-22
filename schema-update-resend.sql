-- Add resend tracking column to existing email_messages table
-- This is a safe update that only adds the new column

-- Add the resend_of column to track resend relationships
ALTER TABLE public.email_messages 
ADD COLUMN IF NOT EXISTS resend_of UUID REFERENCES public.email_messages(id) ON DELETE SET NULL;

-- Add an index for better query performance on resend relationships
CREATE INDEX IF NOT EXISTS idx_email_messages_resend_of ON public.email_messages(resend_of);

-- Optional: Add a comment to document the column purpose
COMMENT ON COLUMN public.email_messages.resend_of IS 'References the original email that this is a resend of';
