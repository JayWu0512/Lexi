import { DictionaryResult } from '../types';

// --- Dictionary API Service ---

const DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

export const fetchDefinition = async (word: string): Promise<DictionaryResult | null> => {
  // Clean punctuation from word
  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
  
  if (!cleanWord) return null;

  try {
    const response = await fetch(`${DICTIONARY_API_BASE}${cleanWord}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const entry = data[0];

    // Extract Audio URL
    let audioUrl = undefined;
    if (entry.phonetics && Array.isArray(entry.phonetics)) {
        const audioEntry = entry.phonetics.find((p: any) => p.audio && p.audio !== '');
        if (audioEntry) {
            audioUrl = audioEntry.audio;
            // Ensure protocol is present
            if (audioUrl?.startsWith('//')) {
                audioUrl = 'https:' + audioUrl;
            }
        }
    }

    // Extract Synonyms (aggregate from all meanings)
    const synonymsSet = new Set<string>();
    if (entry.meanings && Array.isArray(entry.meanings)) {
        entry.meanings.forEach((m: any) => {
            if (m.synonyms && Array.isArray(m.synonyms)) {
                m.synonyms.forEach((s: string) => synonymsSet.add(s));
            }
        });
    }
    // Limit synonyms to 5 to avoid clutter
    const synonyms = Array.from(synonymsSet).slice(0, 5);

    return {
      word: entry.word,
      phonetic: entry.phonetic,
      audioUrl,
      synonyms,
      meanings: entry.meanings
    } as DictionaryResult;
  } catch (error) {
    console.error("Error fetching definition:", error);
    return null;
  }
};

// --- Readability Logic (Flesch-Kincaid Grade Level) ---

const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

export const calculateReadingLevel = (text: string): number => {
  const words = text.trim().split(/\s+/);
  const totalWords = words.length;
  if (totalWords === 0) return 0;

  // Approximate sentences by looking for punctuation
  const totalSentences = text.split(/[.!?]+/).length - 1 || 1;
  
  let totalSyllables = 0;
  words.forEach(word => {
    totalSyllables += countSyllables(word);
  });

  // Flesch-Kincaid Grade Level Formula
  // 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
  const score = (0.39 * (totalWords / totalSentences)) + (11.8 * (totalSyllables / totalWords)) - 15.59;
  
  return Math.max(0, Math.round(score * 10) / 10); // Round to 1 decimal, min 0
};

// --- TTS Helper ---

export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
};