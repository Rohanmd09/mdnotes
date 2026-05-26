import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iwxyifvpcocgsldufxtl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eHlpZnZwY29jZ3NsZHVmeHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTQyMjEsImV4cCI6MjA5NDk3MDIyMX0.vvbRLZ9Zlth4stqIhyqF2x8jzPuR1G7CvIRhPmjW93c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
