import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://shxhysjrentsweemenjl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeGh5c2pyZW50c3dlZW1lbmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjM0NjcsImV4cCI6MjA4ODU5OTQ2N30.rg3onzzEj1kMZ3mtZ4K_Iy90Jj3ruokfDrwYq313gKo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
