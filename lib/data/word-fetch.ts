/**
 * Word fetching utilities for vocabulary learning
 * Provides client-side functions to retrieve words from the dictionary
 */

import { supabase } from '@/lib/supabase/client'

/**
 * Word data structure returned from the dictionary table
 */
export interface Word {
  id: string
  english_word: string
  chinese_translation: string
  example_sentence: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Result type for word fetching operations
 */
export interface WordFetchResult {
  data: Word | null
  error: Error | null
  success: boolean
}

/**
 * Fetches a single random word from the dictionary table
 * This function is designed for guest users and doesn't require authentication
 *
 * @returns Promise<WordFetchResult> - The random word or error information
 */
export async function fetchRandomWord(): Promise<WordFetchResult> {
  try {
    // Get total count of words in the dictionary
    const { count, error: countError } = await supabase
      .from('dictionary')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting dictionary words:', countError)
      return {
        data: null,
        error: new Error('Failed to count dictionary words'),
        success: false
      }
    }

    if (!count || count === 0) {
      return {
        data: null,
        error: new Error('No words found in dictionary'),
        success: false
      }
    }

    // Generate a random offset
    const randomOffset = Math.floor(Math.random() * count)

    // Fetch a single random word using the offset
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .range(randomOffset, randomOffset)
      .single()

    if (error) {
      console.error('Error fetching random word:', error)
      return {
        data: null,
        error: new Error('Failed to fetch random word'),
        success: false
      }
    }

    if (!data) {
      return {
        data: null,
        error: new Error('No word data returned'),
        success: false
      }
    }

    return {
      data: data as Word,
      error: null,
      success: true
    }

  } catch (error) {
    console.error('Unexpected error in fetchRandomWord:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }
  }
}

/**
 * Fetches multiple random words from the dictionary table
 *
 * @param count - Number of words to fetch (default: 5)
 * @returns Promise<WordFetchResult[]> - Array of random words or error information
 */
export async function fetchRandomWords(count: number = 5): Promise<WordFetchResult[]> {
  try {
    const results: WordFetchResult[] = []

    // Fetch words one by one to ensure randomness
    for (let i = 0; i < count; i++) {
      const result = await fetchRandomWord()
      results.push(result)
    }

    return results
  } catch (error) {
    console.error('Unexpected error in fetchRandomWords:', error)
    return [{
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }]
  }
}

/**
 * Fetches a specific word by its ID
 *
 * @param wordId - The UUID of the word to fetch
 * @returns Promise<WordFetchResult> - The word or error information
 */
export async function fetchWordById(wordId: string): Promise<WordFetchResult> {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .eq('id', wordId)
      .single()

    if (error) {
      console.error('Error fetching word by ID:', error)
      return {
        data: null,
        error: new Error('Failed to fetch word by ID'),
        success: false
      }
    }

    if (!data) {
      return {
        data: null,
        error: new Error('Word not found'),
        success: false
      }
    }

    return {
      data: data as Word,
      error: null,
      success: true
    }

  } catch (error) {
    console.error('Unexpected error in fetchWordById:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }
  }
}

/**
 * Fetches all words from the dictionary table
 * Note: This should be used sparingly as it loads all words into memory
 *
 * @returns Promise<WordFetchResult[]> - Array of all words or error information
 */
export async function fetchAllWords(): Promise<WordFetchResult[]> {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .order('english_word', { ascending: true })

    if (error) {
      console.error('Error fetching all words:', error)
      return [{
        data: null,
        error: new Error('Failed to fetch all words'),
        success: false
      }]
    }

    if (!data || data.length === 0) {
      return [{
        data: null,
        error: new Error('No words found in dictionary'),
        success: false
      }]
    }

    return data.map(word => ({
      data: word as Word,
      error: null,
      success: true
    }))

  } catch (error) {
    console.error('Unexpected error in fetchAllWords:', error)
    return [{
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }]
  }
}

export default {
  fetchRandomWord,
  fetchRandomWords,
  fetchWordById,
  fetchAllWords
}