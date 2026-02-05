import { NpcVisualAnchor, LocationVisualAnchor } from '@shadows/shared';

/**
 * Visual Anchors for "The Missing Heiress" case
 *
 * These descriptions ensure consistent character and location
 * appearances across all generated images.
 */

export const npcAnchors: NpcVisualAnchor[] = [
  {
    npcId: 'harold',
    appearance:
      'Stern 60-year-old white man, silver hair slicked back with pomade, sharp angular jaw, cold piercing blue eyes, deep frown lines, clean-shaven',
    attire:
      'Immaculate charcoal pinstripe three-piece suit, gold pocket watch chain, polished oxford shoes, gold cufflinks with diamond inlay',
    distinctiveFeatures: [
      'Always stands rigidly straight',
      'Whiskey glass perpetually in hand',
      'Signet ring on right pinky',
      'Reading glasses perched on nose when examining documents',
    ],
  },
  {
    npcId: 'dorothy',
    appearance:
      'Dignified Black woman in her late 50s, kind but weary brown eyes, graying hair pulled back in a neat bun, gentle weathered face with smile lines',
    attire:
      'Crisp black housekeeper dress with white collar and cuffs, sensible low-heeled shoes, small silver cross necklace tucked under collar',
    distinctiveFeatures: [
      'Hands always busy — polishing, folding, arranging',
      'Posture of quiet strength',
      'Apron pocket holding a worn photograph',
      'Reading glasses on a chain around neck',
    ],
  },
  {
    npcId: 'marcus',
    appearance:
      'Handsome Black man in his early 30s, warm soulful brown eyes, short natural hair, strong jaw, easy smile that doesn\'t quite reach his worried eyes',
    attire:
      'Well-worn brown leather jacket over white shirt open at collar, dark slacks, scuffed but polished shoes, trumpet case always nearby',
    distinctiveFeatures: [
      'Long musician\'s fingers, callused from trumpet valves',
      'Taps rhythms unconsciously on surfaces',
      'Trumpet mouthpiece in jacket pocket',
      'Thin gold chain with small pendant hidden under shirt',
    ],
  },
  {
    npcId: 'frank',
    appearance:
      'Weathered white man in his late 40s, world-weary hazel eyes, salt-and-pepper stubble, crooked nose (broken twice), thinning hair under fedora',
    attire:
      'Rumpled tan trench coat over cheap brown suit, loosened tie, scuffed wingtips, fedora hat with sweat-stained band',
    distinctiveFeatures: [
      'Lucky Strike cigarette perpetually between lips or fingers',
      'Shoulder holster bulge under coat',
      'Notepad and pencil stub in breast pocket',
      'Leans against walls instead of standing straight',
    ],
  },
];

export const locationAnchors: LocationVisualAnchor[] = [
  {
    locationId: 'mansion',
    environment:
      '1940s Spanish Colonial Revival mansion in Bel Air, white stucco walls, red tile roof, manicured hedges, circular driveway with fountain, wrought iron gates',
    keyElements: [
      'Grand arched entryway with heavy oak doors',
      'Tall windows with drawn curtains',
      'Vintage Rolls-Royce in driveway',
      'Manicured rose garden',
      'Palm trees silhouetted against sky',
    ],
    atmosphere:
      'Perpetual dusk lighting, fog rolling in from the hills, warm light spilling from windows, oppressive wealth and secrets',
  },
  {
    locationId: 'blue-moon',
    environment:
      '1940s basement jazz club on Central Avenue, narrow stairway down from street, low ceilings, intimate stage, scattered round tables with candles',
    keyElements: [
      'Blue neon "Blue Moon" sign at entrance',
      'Small stage with upright piano and microphone',
      'Smoke hanging in layers in the air',
      'Bar with bottles backlit amber',
      'Velvet curtains and dark wood paneling',
    ],
    atmosphere:
      'Smoky haze, blue and amber lighting, intimate and dangerous, music you can almost hear, shadows hiding secrets in every booth',
  },
  {
    locationId: 'docks',
    environment:
      'San Pedro harbor warehouse district at night, wooden piers, rusting cranes, stacked shipping crates, Warehouse 7 with fresh padlock',
    keyElements: [
      'Fog rolling in from the Pacific',
      'Ships creaking at moorings',
      'Single lamp post casting cone of light',
      'Warehouse 7 with "ASHWORTH SHIPPING" faded on side',
      'Wet cobblestones reflecting light',
    ],
    atmosphere:
      'Dense fog, isolated pools of light, desolate and threatening, the smell of salt and secrets, noir chiaroscuro lighting',
  },
  {
    locationId: 'office',
    environment:
      'Harold Ashworth\'s private study inside the mansion, dark wood paneling, floor-to-ceiling bookshelves, massive mahogany desk, leather chairs',
    keyElements: [
      'Desk covered in shipping schedules and papers',
      'Brass desk lamp casting warm circle of light',
      'Crystal whiskey decanter and glasses',
      'Locked filing cabinet in corner',
      'Oil portrait of deceased wife on wall',
    ],
    atmosphere:
      'Cigar smoke lingering, concentrated power, secrets in every drawer, warm lamp light against dark shadows, masculine and intimidating',
  },
];

/** Style suffixes for different moods */
export const styleModifiers = {
  noir: 'classic 1940s film noir cinematography, high contrast black and white with deep shadows, dramatic chiaroscuro lighting, atmospheric fog',
  dramatic: 'dramatic low-angle shot, tension visible in composition, spotlight effect, sharp shadows',
  mysterious: 'obscured details, partial silhouettes, foggy atmosphere, questions in every shadow',
  tense: 'tight framing, shallow depth of field, sweat and worry visible, claustrophobic composition',
};

/** Base style applied to all images */
export const baseStyle =
  'cinematic 1940s Los Angeles noir aesthetic, film grain texture, muted sepia and blue tones, Raymond Chandler atmosphere, professional photography';
