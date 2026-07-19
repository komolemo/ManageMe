import { create } from "zustand";
import { tagApi } from "@/features/tag/tagApi";
import type {
  CreateTagInput,
  Tag,
  UpdateTagInput,
} from "@/features/tag/types";

type TagStore = {
  error: string | null;
  isLoading: boolean;
  isLoaded: boolean;
  suggestions: Tag[];
  tags: Tag[];
  clearError: () => void;
  createTag: (input: CreateTagInput) => Promise<Tag>;
  getTagById: (tagId: string) => Promise<Tag | null>;
  loadTags: (force?: boolean) => Promise<void>;
  searchTags: (query: string, limit?: number) => Promise<Tag[]>;
  touchTagLastUsed: (tagId: string) => Promise<Tag | null>;
  updateTag: (
    tagId: string,
    input: UpdateTagInput,
  ) => Promise<Tag | null>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function replaceTag(tags: Tag[], tag: Tag) {
  return tags.map((entry) => (entry.tagId === tag.tagId ? tag : entry));
}

export const useTagStore = create<TagStore>((set, get) => ({
  error: null,
  isLoading: false,
  isLoaded: false,
  suggestions: [],
  tags: [],

  clearError: () => set({ error: null }),

  loadTags: async (force = false) => {
    const state = get();
    if (state.isLoading || (!force && state.isLoaded)) {
      return;
    }
    set({ error: null, isLoading: true });
    try {
      const tags = await tagApi.list();
      set({ isLoaded: true, tags });
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getTagById: async (tagId) => {
    set({ error: null });
    try {
      const tag = await tagApi.getById(tagId);
      if (tag) {
        set((state) => ({
          tags: state.tags.some((entry) => entry.tagId === tag.tagId)
            ? replaceTag(state.tags, tag)
            : [...state.tags, tag],
        }));
      }
      return tag;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  searchTags: async (query, limit = 5) => {
    set({ error: null });
    try {
      const suggestions = await tagApi.search(query, limit);
      set({ suggestions });
      return suggestions;
    } catch (error) {
      set({ error: errorMessage(error), suggestions: [] });
      throw error;
    }
  },

  createTag: async (input) => {
    set({ error: null });
    try {
      const tag = await tagApi.create(input);
      set((state) => ({ tags: [tag, ...state.tags] }));
      return tag;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  updateTag: async (tagId, input) => {
    set({ error: null });
    try {
      const tag = await tagApi.update(tagId, input);
      if (tag) {
        set((state) => ({ tags: replaceTag(state.tags, tag) }));
      }
      return tag;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  touchTagLastUsed: async (tagId) => {
    set({ error: null });
    try {
      const tag = await tagApi.touchLastUsed(tagId);
      if (tag) {
        set((state) => ({ tags: replaceTag(state.tags, tag) }));
      }
      return tag;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },
}));
