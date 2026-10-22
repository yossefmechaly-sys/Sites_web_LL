import type { CollectionConfig, GlobalConfig } from 'payload'

// Les pages du site sont mises en cache (ISR). Toute modification faite dans l'admin — ou par
// l'import des matchs lancé dans le serveur — vide ce cache pour que le site soit à jour aussitôt.
async function revalidateSite() {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Hors du serveur Next.js (scripts « payload run ») : pas de cache à vider,
    // les pages se mettront à jour au plus tard après 5 minutes.
  }
}

// Collections dont le contenu n'apparaît pas sur le site public
const PRIVATE = new Set(['users', 'subscribers', 'members', 'pre-orders'])

export function withRevalidation(collection: CollectionConfig): CollectionConfig {
  if (PRIVATE.has(collection.slug)) return collection
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), revalidateSite],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), revalidateSite],
    },
  }
}

export function withGlobalRevalidation(global: GlobalConfig): GlobalConfig {
  return {
    ...global,
    hooks: { ...global.hooks, afterChange: [...(global.hooks?.afterChange ?? []), revalidateSite] },
  }
}
