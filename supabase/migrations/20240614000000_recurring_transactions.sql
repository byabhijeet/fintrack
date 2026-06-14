-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid(),
    title text NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    frequency text NOT NULL CHECK (frequency = ANY (ARRAY['daily', 'weekly', 'monthly', 'yearly'])),
    category_id uuid REFERENCES public.finance_categories(id),
    next_due date NOT NULL,
    last_run date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own recurring transactions"
    ON public.recurring_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions"
    ON public.recurring_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
    ON public.recurring_transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
    ON public.recurring_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Daily processing function
CREATE OR REPLACE FUNCTION public.process_recurring_transactions()
RETURNS void AS $$
DECLARE
    rec RECORD;
    new_next_due date;
BEGIN
    FOR rec IN
        SELECT * FROM public.recurring_transactions
        WHERE is_active = true AND next_due <= CURRENT_DATE
    LOOP
        -- Insert into finance_entries
        INSERT INTO public.finance_entries (
            user_id,
            category_id,
            amount,
            entry_date,
            description,
            context,
            meta
        ) VALUES (
            rec.user_id,
            rec.category_id,
            rec.amount,
            rec.next_due,
            '[Auto] ' || rec.title,
            'expense',
            jsonb_build_object('recurring_transaction_id', rec.id)
        );

        -- Calculate next_due
        IF rec.frequency = 'daily' THEN
            new_next_due := rec.next_due + INTERVAL '1 day';
        ELSIF rec.frequency = 'weekly' THEN
            new_next_due := rec.next_due + INTERVAL '1 week';
        ELSIF rec.frequency = 'monthly' THEN
            new_next_due := (rec.next_due + INTERVAL '1 month')::date;
        ELSIF rec.frequency = 'yearly' THEN
            new_next_due := (rec.next_due + INTERVAL '1 year')::date;
        END IF;

        -- Update recurring_transactions
        UPDATE public.recurring_transactions
        SET last_run = rec.next_due,
            next_due = new_next_due
        WHERE id = rec.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the cron job to run at 00:00 daily
SELECT cron.schedule('daily-recurring-transactions', '0 0 * * *', 'SELECT public.process_recurring_transactions()');
