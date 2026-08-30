import type { Reference } from '../core/types'

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`

export type ReferenceLibraryItem = Omit<Reference, 'status' | 'notes' | 'rotation'>

const entries: Array<[string, string, string, string, string[], string[]]> = [
  ['canyon-light', 'Canyon light', 'Field photography', 'Photography', ['landscape', 'light', 'warmth'], ['#D86B32', '#F2DAC8']],
  ['trail-sign', 'Trail sign language', 'Wayfinding archive', 'Graphic motif', ['graphic', 'shape', 'trail'], ['#173A2B', '#D86B32']],
  ['woven-canvas', 'Woven canvas', 'Material study', 'Material / motif', ['texture', 'material', 'tactile'], ['#D8C4A7', '#6A4A36']],
  ['campfire', 'Campfire at dusk', 'Field photography', 'Photography', ['human', 'night', 'warmth'], ['#F08342', '#20243A']],
  ['field-journal', 'Field journal', 'Editorial archive', 'Visual anchor', ['editorial', 'type', 'process'], ['#F5E5D4', '#2C3322']],
  ['orange-rock', 'Oxide rock', 'Material study', 'Material / motif', ['texture', 'earth', 'colour'], ['#A94C1B', '#EFC5A0']],
  ['blue-sky', 'Cobalt sky', 'Field photography', 'Photography', ['blue', 'contrast', 'landscape'], ['#0040E0', '#E5F0FF']],
  ['rope-knot', 'Rope knot', 'Equipment archive', 'Graphic motif', ['utility', 'texture', 'handmade'], ['#D8B487', '#403025']],
  ['trail-map', 'Topographic trail map', 'Cartography archive', 'Visual anchor', ['map', 'line', 'editorial'], ['#4D6328', '#F0E9D6']],
  ['linen-shirt', 'Linen in motion', 'Field photography', 'Photography', ['human', 'fabric', 'calm'], ['#E7D5C1', '#405745']],
  ['sun-shadow', 'Sun shadow', 'Architecture study', 'Photography', ['light', 'geometry', 'quiet'], ['#F7E3CC', '#533F31']],
  ['clay-vessel', 'Clay vessel', 'Craft archive', 'Material / motif', ['clay', 'craft', 'earth'], ['#B8582D', '#E9B692']],
  ['forest-type', 'Forest type specimen', 'Typography archive', 'Visual anchor', ['type', 'forest', 'contrast'], ['#243D26', '#EEE7D7']],
  ['badge-stamp', 'Stamped badge', 'Trail marks', 'Graphic motif', ['badge', 'stamp', 'graphic'], ['#183C2D', '#E5A55C']],
  ['field-table', 'Field table', 'Studio desk', 'Material / motif', ['process', 'tools', 'research'], ['#2B2925', '#E8D5C2']],
  ['ridge-walk', 'Ridge walk', 'Field photography', 'Photography', ['human', 'landscape', 'motion'], ['#64766B', '#F0B07A']],
  ['rain-jacket', 'Technical orange', 'Equipment archive', 'Photography', ['utility', 'orange', 'human'], ['#E25C20', '#243B38']],
  ['paper-edge', 'Torn paper edge', 'Print archive', 'Graphic motif', ['paper', 'editorial', 'texture'], ['#EEE3D6', '#211B18']],
  ['wild-grass', 'Wild grass', 'Field photography', 'Photography', ['nature', 'olive', 'soft'], ['#687348', '#EEE1C7']],
  ['path-stones', 'Path stones', 'Field photography', 'Material / motif', ['stone', 'path', 'grounded'], ['#88816E', '#D9C8B2']],
  ['printed-poster', 'Printed expedition poster', 'Print archive', 'Visual anchor', ['poster', 'type', 'colour'], ['#BD421B', '#163C34']],
  ['pack-detail', 'Pack detail', 'Equipment archive', 'Photography', ['gear', 'utility', 'texture'], ['#544438', '#D2B17F']],
  ['lake-mist', 'Lake mist', 'Field photography', 'Photography', ['lake', 'mist', 'calm'], ['#AEBFBA', '#304E48']],
  ['marker-paint', 'Hand-painted marker', 'Trail marks', 'Graphic motif', ['mark', 'blue', 'handmade'], ['#0040E0', '#EFCBC2']],
  ['red-earth', 'Red earth', 'Field photography', 'Material / motif', ['earth', 'red', 'landscape'], ['#A8431C', '#F2D4BC']],
  ['shelter', 'Canvas shelter', 'Field photography', 'Photography', ['shelter', 'canvas', 'adventure'], ['#C9A775', '#354537']],
  ['quiet-book', 'Quiet book spread', 'Editorial archive', 'Visual anchor', ['book', 'layout', 'editorial'], ['#EEE3D0', '#342D25']],
  ['trail-sole', 'Trail sole', 'Equipment archive', 'Material / motif', ['footwear', 'pattern', 'utility'], ['#3B3930', '#D97635']],
  ['green-door', 'Forest green door', 'Architecture study', 'Graphic motif', ['green', 'shape', 'contrast'], ['#173E2C', '#E9C6A8']],
  ['dawn-hiker', 'Dawn hiker', 'Field photography', 'Photography', ['human', 'dawn', 'landscape'], ['#D28E58', '#385264']],
  ['stone-print', 'Stone print', 'Print archive', 'Visual anchor', ['print', 'stone', 'texture'], ['#A98B71', '#F0E5D8']],
  ['typographic-wayfinding', 'Typographic wayfinding', 'Wayfinding archive', 'Graphic motif', ['type', 'wayfinding', 'graphic'], ['#1C382B', '#EEE6D4']],
  ['moss-detail', 'Moss detail', 'Field photography', 'Material / motif', ['moss', 'macro', 'olive'], ['#5B6A37', '#BCB787']],
  ['hand-sign', 'Hand-drawn sign', 'Trail marks', 'Graphic motif', ['sign', 'handmade', 'type'], ['#4F362A', '#F1D7BF']],
  ['sunset-peak', 'Sunset peak', 'Field photography', 'Photography', ['mountain', 'sunset', 'bold'], ['#CF5228', '#242A4D']],
  ['camp-stool', 'Camp stool', 'Equipment archive', 'Material / motif', ['camp', 'object', 'human'], ['#B88961', '#393A31']]
]

const photoIds = [
  'photo-1500534623283-312aade485b7', 'photo-1464822759023-fed622ff2c3b', 'photo-1500534314209-a25ddb2bd429', 'photo-1482192596544-9eb780fc7f66', 'photo-1470770841072-f978cf4d019e', 'photo-1441974231531-c6227db76b6e', 'photo-1506744038136-46273834b3fb', 'photo-1511497584788-876760111969', 'photo-1448375240586-882707db888b', 'photo-1473448912268-2022ce9509d8', 'photo-1490730141103-6cac27aaab94', 'photo-1470770841072-f978cf4d019e'
]

export const wanderwellReferenceLibrary: ReferenceLibraryItem[] = entries.map(([id, title, source, group, tags, extractedColors], index) => ({
  id,
  title,
  image: image(photoIds[index % photoIds.length]),
  source,
  tags,
  group,
  extractedColors,
  createdBy: 'agent'
}))

export interface ReferenceProvider {
  search(query: string, tags?: string[], limit?: number): ReferenceLibraryItem[]
}

export const localReferenceProvider: ReferenceProvider = {
  search(query, tags = [], limit = 12) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    return wanderwellReferenceLibrary.filter((item) => {
      const haystack = [item.title, item.source, item.group, ...item.tags].join(' ').toLowerCase()
      return terms.every((term) => haystack.includes(term)) && tags.every((tag) => item.tags.includes(tag))
    }).slice(0, Math.max(1, Math.min(limit, 40)))
  }
}

export const referenceFromLibrary = (item: ReferenceLibraryItem): Reference => ({ ...item, status: 'neutral', notes: '', rotation: 0 })
