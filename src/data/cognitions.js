/**
 * AURA OF THE UNSEEN — COGNITION REGISTRIES
 *
 * Five categories of accumulated knowledge. Each entry may have progressive
 * tiers: the more knowledge[id] the player holds, the fuller the picture.
 *
 * Knowledge is incremented by: dialogue interactions, item discovery,
 * location exploration, and triggered game events.
 *
 * Tier structure:
 *   { level: number, content: string }
 *   — A tier is visible when gameState.knowledge[id] >= tier.level
 *   — Tiers at level 0 are always visible once the entry is unlocked
 *
 * Entry unlock:
 *   — ABILITIES:   seenFacets[] (set by DialogueSystem)
 *   — All others:  knowledge[id] > 0, OR unlockFlag set in gameState.flags
 */

// ── ABILITIES ─────────────────────────────────────────────────────────────────
// Re-exported from facets.js so the rest of the system stays in one place.
export { FACET_REGISTRY as ABILITIES_REGISTRY } from './facets';

// ── REVELATIONS ───────────────────────────────────────────────────────────────
// Historical truths and systemic realities that surface through play.
// The more you engage, the fuller the account becomes.

export const REVELATIONS_REGISTRY = {

  the_middle_passage: {
    id: 'the_middle_passage',
    name: 'THE MIDDLE PASSAGE',
    unlockFlag: null, // unlocked via knowledge[id] > 0
    tiers: [
      {
        level: 0,
        content:
          "A crossing. Millions were taken from the coast of West and Central Africa, " +
          "packed into ships bound for the Americas. The journey lasted weeks. " +
          "Many did not survive it.",
      },
      {
        level: 2,
        content:
          "Between 12.5 and 15 million people were transported across the Atlantic " +
          "between the 15th and 19th centuries. Roughly 2 million died at sea — " +
          "from disease, violence, and deliberate starvation. " +
          "The dead were thrown overboard. Their bodies mapped the route.",
      },
      {
        level: 4,
        content:
          "Survivors arrived chained and catalogued as cargo. They were sold at auction, " +
          "their families split without ceremony. The Transatlantic Slave Trade was not " +
          "a peripheral event — it was the financial foundation of European empire, " +
          "the engine behind the Industrial Revolution, and the mechanism by which " +
          "entire civilisations were dismantled. The wound has not closed.",
      },
    ],
  },

  the_overseer_system: {
    id: 'the_overseer_system',
    name: 'THE OVERSEER SYSTEM',
    unlockFlag: null,
    tiers: [
      {
        level: 0,
        content:
          "Overseers were employed to enforce productivity on plantations and estates. " +
          "They operated between the owner and the enslaved — wielding delegated power " +
          "with little accountability.",
      },
      {
        level: 2,
        content:
          "Many overseers were poor white men for whom the role offered social elevation. " +
          "Their authority was absolute within the bounds of the property. " +
          "Violence was not incidental — it was the system. Quotas were met by fear. " +
          "Infractions, real or invented, were punished publicly.",
      },
      {
        level: 4,
        content:
          "The overseer system was designed to fragment solidarity. By placing one class " +
          "of poor whites above enslaved people, plantation owners created a buffer " +
          "between themselves and resistance. It also bound poor whites to a system " +
          "that did not serve them — but gave them someone to stand above. " +
          "That bargain echoes through centuries of American social architecture.",
      },
    ],
  },

  the_ledger: {
    id: 'the_ledger',
    name: 'THE LEDGER',
    unlockFlag: null,
    tiers: [
      {
        level: 0,
        content:
          "Plantation ledgers recorded everything. Births, deaths, purchases, " +
          "punishments. Human beings entered as line items — name, age, " +
          "estimated value, condition.",
      },
      {
        level: 2,
        content:
          "These documents were meticulous because enslaved people were property, " +
          "and property required accounting. Insurance was taken out on them. " +
          "They were used as collateral for loans. When they died, the loss was " +
          "financial before it was anything else.",
      },
      {
        level: 4,
        content:
          "The ledger is also a record of resistance, if you know how to read it. " +
          "The same document that catalogues a person's value also records " +
          "when they ran, when they refused, when they were punished for " +
          "infractions that required no explanation — because to exist " +
          "with dignity within that system was itself an act of defiance.",
      },
    ],
  },

  free_papers: {
    id: 'free_papers',
    name: 'FREE PAPERS',
    unlockFlag: null,
    tiers: [
      {
        level: 0,
        content:
          "A document that proved a Black person's freedom. Without it, " +
          "any free Black person could be seized and re-enslaved at any time.",
      },
      {
        level: 2,
        content:
          "Free papers could be lost, stolen, or simply disbelieved. " +
          "Law enforcement — and civilians — had every incentive to ignore them. " +
          "The burden of proof for one's own humanity was placed entirely " +
          "on the person whose humanity was being questioned.",
      },
      {
        level: 4,
        content:
          "Freedom on paper did not mean freedom in practice. Free Black people " +
          "in the antebellum South were surveilled, restricted in movement, " +
          "barred from most trades, and subject to re-enslavement on the flimsiest " +
          "legal pretext. The paper was a target as much as a protection. " +
          "Many kept theirs hidden. Some memorised the text in case it was taken.",
      },
    ],
  },

  reconstruction: {
    id: 'reconstruction',
    name: 'THE RECONSTRUCTION',
    unlockFlag: null,
    tiers: [
      {
        level: 0,
        content:
          "After the Civil War, the Reconstruction era (1865–1877) briefly promised " +
          "political and civil rights for formerly enslaved people across the South.",
      },
      {
        level: 2,
        content:
          "Black men voted and held office. Schools were built. Families separated by " +
          "slavery tried to find one another. For twelve years, a different South " +
          "seemed possible. Then federal troops withdrew, and the backlash began. " +
          "What followed was systematic, violent, and deliberate.",
      },
      {
        level: 4,
        content:
          "By 1880 — the year this story takes place — Reconstruction was already " +
          "being dismantled. Black Codes restricted movement. Sharecropping replaced " +
          "slavery in function if not in name. The Ku Klux Klan terrorised communities " +
          "with impunity. The promise had been made, and then methodically broken. " +
          "What we call 'history' was, for those living it, the world closing back in.",
      },
    ],
  },

};

// ── PEOPLE ────────────────────────────────────────────────────────────────────
// The individuals Maya encounters. Knowledge reveals context: who they are,
// what shaped them, what they carry.

export const PEOPLE_REGISTRY = {

  silas_pemberton: {
    id: 'silas_pemberton',
    name: 'SILAS PEMBERTON',
    image: null,
    tiers: [
      {
        level: 0,
        content:
          "A man employed in the household. He seems nervous — watchful in the way " +
          "of someone used to being observed. He avoids certain rooms.",
      },
      {
        level: 1,
        content:
          "Silas has worked here for three years. He came from further south. " +
          "He does not speak about what came before, but the way he moves " +
          "through this house — careful, contained, alert — tells you something " +
          "about what it cost him to survive to this point.",
      },
      {
        level: 3,
        content:
          "Silas carries a note he has never delivered. Whatever it says, " +
          "it matters to him enough to hide it. He trusts very few people, " +
          "for reasons that have nothing to do with character and everything " +
          "to do with history. He has learned that trust has a price, " +
          "and he has paid it before.",
      },
    ],
  },

  the_overseer: {
    id: 'the_overseer',
    name: 'THE OVERSEER',
    image: '/ui/portraits/overseer_portrait.png',
    tiers: [
      {
        level: 0,
        content:
          "He moves through the house with the ease of someone who has never " +
          "had to justify his presence. He notices things. He remembers them.",
      },
      {
        level: 1,
        content:
          "His authority here is real and enforced. He keeps records. " +
          "He tracks who goes where, who speaks to whom. " +
          "He has been in this role long enough that surveillance has become " +
          "instinct — he is not looking for something specific. He is simply always looking.",
      },
      {
        level: 3,
        content:
          "Men like him were not born cruel. They were given a role that required cruelty " +
          "and discovered they could perform it. The system needed someone between " +
          "the owner and the owned, someone willing to enforce the distance. " +
          "He became that. Whether he thinks about what that means " +
          "is not something he lets anyone close enough to know.",
      },
    ],
  },

};

// ── PLACES ────────────────────────────────────────────────────────────────────
// Locations Maya inhabits. The deeper the knowledge, the more the architecture
// reveals about who built it, who maintained it, and what it was built for.

export const PLACES_REGISTRY = {

  the_house: {
    id: 'the_house',
    name: 'THE HOUSE',
    image: null,
    tiers: [
      {
        level: 0,
        content:
          "A household in 1880. Furnished, managed, lived in. " +
          "The kind of house that runs on invisible labour.",
      },
      {
        level: 1,
        content:
          "The architecture of a house like this was designed with service in mind. " +
          "Back entrances, service corridors, rooms within earshot of the main hall. " +
          "The people who built and maintained it were not meant to be seen, " +
          "only their work.",
      },
      {
        level: 3,
        content:
          "Every material in this house — the cotton in the curtains, " +
          "the sugar in the pantry, the wood in the floors — " +
          "arrived here through a chain of extraction that began in the fields, " +
          "on the ships, in the holds. The house is comfortable " +
          "because discomfort was outsourced. It is clean " +
          "because the dirt was moved somewhere else.",
      },
    ],
  },

};

// ── THINGS ────────────────────────────────────────────────────────────────────
// Objects and artefacts. The more you know, the more an object reveals
// about the world that made it.

export const THINGS_REGISTRY = {

  the_folded_note: {
    id: 'the_folded_note',
    name: 'THE FOLDED NOTE',
    image: null,
    tiers: [
      {
        level: 0,
        content:
          "A piece of paper, folded twice. It has been handled many times — " +
          "the creases are soft with use. Someone needed to keep this, " +
          "but could not keep it openly.",
      },
      {
        level: 1,
        content:
          "Letters and notes were precious. For much of the 19th century, " +
          "literacy itself was a crime for enslaved people in many states. " +
          "A written note meant someone had learned to read and write " +
          "despite — or because of — every obstacle placed against it.",
      },
      {
        level: 2,
        content:
          "What the note contains is less important than the fact of its existence. " +
          "Someone committed words to paper and hid them. " +
          "The act of writing, of recording, of insisting that something be remembered " +
          "— that is the thing that could not be taken, even when everything else was.",
      },
    ],
  },

  indenture_contract: {
    id: 'indenture_contract',
    name: 'THE CONTRACT',
    image: null,
    tiers: [
      {
        level: 0,
        content:
          "A legal document binding a person to service for a fixed term. " +
          "The language is formal. The language is always formal.",
      },
      {
        level: 2,
        content:
          "Indenture contracts were often signed under conditions of extreme coercion — " +
          "debt, threat, or outright deception. Illiteracy was common, " +
          "and the terms were rarely explained. The contract was a tool " +
          "for making exploitation look like agreement.",
      },
      {
        level: 4,
        content:
          "After the formal end of slavery, systems of debt peonage and indenture " +
          "continued the same extraction under different paperwork. " +
          "The law had changed. The conditions had not. " +
          "The document gave it the appearance of consent. " +
          "Appearance was all it was ever meant to give.",
      },
    ],
  },

};
