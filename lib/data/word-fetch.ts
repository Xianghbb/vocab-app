/**
 * Word fetching utilities for vocabulary learning
 * Provides client-side functions to retrieve words from the dictionary
 * Includes prioritized fetching for authenticated users based on their learning progress
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
    const { count, error: countError } = await ((supabase as any) as any)
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
    const { data, error } = await (supabase as any)
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
    const { data, error } = await (supabase as any)
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
    const { data, error } = await (supabase as any)
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

    return data.map((word: any) => ({
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

/**
 * Fetches a prioritized word for a specific user based on their learning progress
 * First tries to get words marked as 'unknown' or 'new', then falls back to unreviewed words
 *
 * @param userId - The ID of the user to fetch a prioritized word for
 * @returns Promise<WordFetchResult> - A prioritized word or error information
 */
export async function fetchPrioritizedWord(userId: string): Promise<WordFetchResult> {
  try {
    // Step 1: Try to get words marked as 'unknown' or 'new' for this user
    const { data: priorityWords, error: priorityError } = await (supabase as any)
      .from('user_progress')
      .select(`
        word_id,
        status,
        dictionary!inner(*)
      `)
      .eq('user_id', userId)
      .in('status', ['unknown', 'new'])
      .order('last_reviewed_at', { ascending: true })
      .limit(50) // Limit to avoid too much data transfer

    if (priorityError) {
      console.error('Error fetching priority words:', priorityError)
      // Fall back to random word if there's an error
      return await fetchRandomWord()
    }

    if (priorityWords && priorityWords.length > 0) {
      // Randomly select one from the priority words
      const randomIndex = Math.floor(Math.random() * priorityWords.length)
      const selectedWord = priorityWords[randomIndex]

      return {
        data: {
          id: selectedWord.word_id,
          english_word: selectedWord.dictionary.english_word,
          chinese_translation: selectedWord.dictionary.chinese_translation,
          example_sentence: selectedWord.dictionary.example_sentence,
          created_at: selectedWord.dictionary.created_at,
          updated_at: selectedWord.dictionary.updated_at
        },
        error: null,
        success: true
      }
    }

    // Step 2: If no priority words found, get words not yet marked as 'known' by this user
    // First, get all word IDs that the user has marked as 'known'
    const { data: knownWords, error: knownError } = await (supabase as any)
      .from('user_progress')
      .select('word_id')
      .eq('user_id', userId)
      .eq('status', 'known')

    if (knownError) {
      console.error('Error fetching known words:', knownError)
      return await fetchRandomWord()
    }

    const knownWordIds = knownWords?.map((wp: any) => wp.word_id) || []

    // Get a random word that's not in the known words list
    if (knownWordIds.length > 0) {
      const { data: newWord, error: newWordError } = await (supabase as any)
        .from('dictionary')
        .select('*')
        .not('id', 'in', `(${knownWordIds.join(',')})`)
        .limit(1)
        .single()

      if (newWordError || !newWord) {
        // If no new words available, fall back to completely random
        return await fetchRandomWord()
      }

      return {
        data: newWord as Word,
        error: null,
        success: true
      }
    }

    // Step 3: If user has no progress records at all, just return a random word
    return await fetchRandomWord()

  } catch (error) {
    console.error('Unexpected error in fetchPrioritizedWord:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unexpected error occurred'),
      success: false
    }
  }
}

/**
 * Fetches multiple prioritized words for a specific user
 *
 * @param userId - The ID of the user to fetch prioritized words for
 * @param count - Number of words to fetch (default: 5)
 * @returns Promise<WordFetchResult[]> - Array of prioritized words or error information
 */
export async function fetchPrioritizedWords(userId: string, count: number = 5): Promise<WordFetchResult[]> {
  try {
    const results: WordFetchResult[] = []

    // Fetch words one by one to ensure proper prioritization
    for (let i = 0; i < count; i++) {
      const result = await fetchPrioritizedWord(userId)
      results.push(result)
    }

    return results
  } catch (error) {
    console.error('Unexpected error in fetchPrioritizedWords:', error)
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
  fetchAllWords,
  fetchPrioritizedWord,
  fetchPrioritizedWords
}