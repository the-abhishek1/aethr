/**
 * Aethr — Full Database Seed Script
 *
 * USAGE:
 *   node prisma/seed.js
 *
 * WHAT IT DOES:
 *   1. Wipes all tables in safe order (respects FK constraints)
 *   2. Creates 10 realistic users (including your 0xIdiot admin account)
 *   3. Seeds: personas, reputation, presence, memory rooms, factions,
 *      signals (with replies + reactions), transmissions, tips, debates
 *      (with arguments + votes), discoveries, messages, follows,
 *      mysteries, monuments, rep trades, notifications, journal entries
 *
 * All passwords are:  aethr2025
 */

const { PrismaClient } = require('@prisma/client')
const { PrismaPg }    = require('@prisma/adapter-pg')
const { Pool }        = require('pg')
const bcrypt = require('bcryptjs')
const path   = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

// Prisma 7 requires the adapter-pg pattern (same as src/lib/prisma.ts)
const pool    = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma  = new PrismaClient({ adapter })

// ─── helpers ────────────────────────────────────────────────────────────────

const hash = (pw) => bcrypt.hashSync(pw, 12)

function ago(days, hours = 0, minutes = 0) {
  return new Date(Date.now() - (days * 86400 + hours * 3600 + minutes * 60) * 1000)
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ─── user definitions ────────────────────────────────────────────────────────

const USERS = [
  {
    username: '0xIdiot',
    email: 'idiot@aethr.fun',
    avatarEmoji: '⚗️',
    bio: 'Builder of galaxies. Architect of Aethr. I made this thing — still figuring out what it is.',
    persona: { name: 'Architect', type: 'work',       worldScope: ['forge', 'commons', 'arena'] },
    presence: { state: 'creating', worldId: 'forge' },
    rep: { wisdom: 88, creativity: 95, discovery: 72, trust: 91, debate: 67, legacy: 54 },
  },
  {
    username: 'lyra_v',
    email: 'lyra@aethr.fun',
    avatarEmoji: '🌙',
    bio: 'Musician, night owl, compulsive note-taker. Finding patterns in noise.',
    persona: { name: 'Composer', type: 'creative', worldScope: ['forge', 'commons'] },
    presence: { state: 'creating', worldId: 'forge' },
    rep: { wisdom: 54, creativity: 88, discovery: 31, trust: 76, debate: 22, legacy: 18 },
  },
  {
    username: 'kaelstrom',
    email: 'kael@aethr.fun',
    avatarEmoji: '🔥',
    bio: 'Professional contrarian. I argue because someone has to. Arena veteran.',
    persona: { name: 'Challenger', type: 'competitor', worldScope: ['arena', 'commons'] },
    presence: { state: 'competing', worldId: 'arena' },
    rep: { wisdom: 44, creativity: 28, discovery: 19, trust: 38, debate: 97, legacy: 33 },
  },
  {
    username: 'nova_thinks',
    email: 'nova@aethr.fun',
    avatarEmoji: '🔭',
    bio: 'Philosophy PhD dropout. I got bored of papers. Now I drop discoveries instead.',
    persona: { name: 'Explorer', type: 'explorer', worldScope: ['deep', 'commons', 'void'] },
    presence: { state: 'exploring', worldId: 'the-deep' },
    rep: { wisdom: 91, creativity: 44, discovery: 88, trust: 82, debate: 61, legacy: 47 },
  },
  {
    username: 'ryn_codes',
    email: 'ryn@aethr.fun',
    avatarEmoji: '🧬',
    bio: 'Systems thinker. I see everything as a graph. Currently mapping the galaxy.',
    persona: { name: 'Analyst', type: 'work', worldScope: ['forge', 'deep', 'commons'] },
    presence: { state: 'deep-work', worldId: 'forge' },
    rep: { wisdom: 67, creativity: 59, discovery: 74, trust: 88, debate: 43, legacy: 29 },
  },
  {
    username: 'solstice_w',
    email: 'sol@aethr.fun',
    avatarEmoji: '🌊',
    bio: 'Writer. Trying to make words feel like worlds. Sometimes it works.',
    persona: { name: 'Storyteller', type: 'creative', worldScope: ['forge', 'commons', 'sanctum'] },
    presence: { state: 'open', worldId: 'commons' },
    rep: { wisdom: 72, creativity: 81, discovery: 38, trust: 91, debate: 34, legacy: 62 },
  },
  {
    username: 'cipher_echo',
    email: 'cipher@aethr.fun',
    avatarEmoji: '🌀',
    bio: 'Security researcher by day. Mystery hunter by night. The Void is my home.',
    persona: { name: 'Phantom', type: 'explorer', worldScope: ['void', 'deep', 'commons'] },
    presence: { state: 'exploring', worldId: 'the-void' },
    rep: { wisdom: 83, creativity: 41, discovery: 92, trust: 58, debate: 77, legacy: 44 },
  },
  {
    username: 'marlowe_x',
    email: 'marlowe@aethr.fun',
    avatarEmoji: '🎭',
    bio: 'Filmmaker. Visual artist. I transmit, therefore I am.',
    persona: { name: 'Director', type: 'creative', worldScope: ['forge', 'commons'] },
    presence: { state: 'creating', worldId: 'forge' },
    rep: { wisdom: 49, creativity: 94, discovery: 27, trust: 69, debate: 31, legacy: 55 },
  },
  {
    username: 'ayla_deep',
    email: 'ayla@aethr.fun',
    avatarEmoji: '🦉',
    bio: 'Neuroscientist. Consciousness nerd. I want to know what you actually think.',
    persona: { name: 'Researcher', type: 'explorer', worldScope: ['deep', 'commons', 'arena'] },
    presence: { state: 'open', worldId: 'commons' },
    rep: { wisdom: 88, creativity: 52, discovery: 77, trust: 84, debate: 66, legacy: 38 },
  },
  {
    username: 'vex_builds',
    email: 'vex@aethr.fun',
    avatarEmoji: '⚡',
    bio: 'Indie hacker. I ship things at 2am and regret nothing. Building in public.',
    persona: { name: 'Maker', type: 'work', worldScope: ['forge', 'commons', 'arena'] },
    presence: { state: 'creating', worldId: 'forge' },
    rep: { wisdom: 56, creativity: 78, discovery: 44, trust: 73, debate: 52, legacy: 31 },
  },
]

// ─── WIPE ────────────────────────────────────────────────────────────────────

async function wipeAll() {
  console.log('🗑  Wiping all tables...')
  // Order matters — children before parents
  await prisma.signalReaction.deleteMany()
  await prisma.mysteryAttempt.deleteMany()
  await prisma.mysteryExplorer.deleteMany()
  await prisma.mystery.deleteMany()
  await prisma.monument.deleteMany()
  await prisma.galaxyEvent.deleteMany()
  await prisma.repTrade.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.journalEntry.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.tip.deleteMany()
  await prisma.transmission.deleteMany()
  await prisma.debateVote.deleteMany()
  await prisma.debateArgument.deleteMany()
  await prisma.debate.deleteMany()
  await prisma.discovery.deleteMany()
  await prisma.signal.deleteMany()   // wipes replies via self-ref cascade
  await prisma.roomMember.deleteMany()
  await prisma.memoryRoom.deleteMany()
  await prisma.factionMember.deleteMany()
  await prisma.faction.deleteMany()
  await prisma.reputation.deleteMany()
  await prisma.presence.deleteMany()
  await prisma.persona.deleteMany()
  await prisma.user.deleteMany()
  console.log('✓  All tables wiped\n')
}

// ─── SEED ────────────────────────────────────────────────────────────────────

async function seed() {
  await wipeAll()

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log('👤  Creating users...')
  const pw = hash('aethr2025')
  const users = []
  for (const def of USERS) {
    const u = await prisma.user.create({
      data: {
        username:     def.username,
        email:        def.email,
        passwordHash: pw,
        avatarEmoji:  def.avatarEmoji,
        bio:          def.bio,
        joinedAt:     ago(Math.floor(Math.random() * 90) + 10),
        personas: { create: { ...def.persona, isActive: true } },
        reputation: { create: def.rep },
        presence:   { create: def.presence },
      },
      include: { personas: true }
    })
    users.push(u)
  }
  console.log(`✓  ${users.length} users created`)

  // Shorthand references
  const [admin, lyra, kael, nova, ryn, sol, cipher, marlowe, ayla, vex] = users

  // ── 2. Follows ────────────────────────────────────────────────────────────
  console.log('👥  Creating follows...')
  const followPairs = [
    [lyra, admin], [kael, admin], [nova, admin], [ryn, admin],
    [admin, lyra], [admin, nova], [admin, cipher],
    [sol, lyra],   [marlowe, lyra], [ayla, nova], [vex, ryn],
    [cipher, nova],[kael, cipher], [nova, ayla],  [sol, ayla],
    [ryn, vex],    [vex, admin],   [ayla, admin], [marlowe, sol],
  ]
  for (const [follower, following] of followPairs) {
    await prisma.follow.create({
      data: { followerId: follower.id, followingId: following.id, createdAt: ago(Math.floor(Math.random() * 30)) }
    })
  }
  console.log(`✓  ${followPairs.length} follows created`)

  // ── 3. Memory Rooms ───────────────────────────────────────────────────────
  console.log('🏛  Creating memory rooms...')
  const room1 = await prisma.memoryRoom.create({
    data: {
      name: 'Builders Lounge', description: 'Where makers talk shop. No pitches. Just craft.',
      worldId: 'commons', color: '#1D9E75', creatorId: admin.id,
      members: { create: [admin, vex, ryn].map(u => ({ userId: u.id })) }
    }
  })
  const room2 = await prisma.memoryRoom.create({
    data: {
      name: 'The Deep Current', description: 'Serious ideas only. Philosophy, science, existence.',
      worldId: 'commons', color: '#378ADD', creatorId: nova.id,
      members: { create: [nova, ayla, cipher, sol].map(u => ({ userId: u.id })) }
    }
  })
  const room3 = await prisma.memoryRoom.create({
    data: {
      name: 'Creative Spark', description: 'Artists, writers, musicians — share your WIPs without judgment.',
      worldId: 'commons', color: '#BA7517', creatorId: lyra.id,
      members: { create: [lyra, marlowe, sol].map(u => ({ userId: u.id })) }
    }
  })
  console.log('✓  3 memory rooms created')

  // ── 4. Factions ───────────────────────────────────────────────────────────
  console.log('⚔️  Creating factions...')
  const faction1 = await prisma.faction.create({
    data: {
      name: 'The Architects', description: 'We build the infrastructure others live on. Craft over hype.',
      color: '#1D9E75', territory: 'The Forge + The Commons',
      members: { create: [
        { userId: admin.id, role: 'leader' },
        { userId: vex.id,   role: 'member' },
        { userId: ryn.id,   role: 'member' },
      ]}
    }
  })
  const faction2 = await prisma.faction.create({
    data: {
      name: 'Void Walkers', description: 'We seek what others fear to find. The Void is not empty — it is full of answers.',
      color: '#7F77DD', territory: 'The Void + The Deep',
      members: { create: [
        { userId: cipher.id, role: 'leader' },
        { userId: nova.id,   role: 'member' },
        { userId: ayla.id,   role: 'member' },
      ]}
    }
  })
  const faction3 = await prisma.faction.create({
    data: {
      name: 'Signal & Noise', description: 'Artists and storytellers. We make things that make you feel things.',
      color: '#D85A30', territory: 'The Forge + The Commons',
      members: { create: [
        { userId: lyra.id,    role: 'leader' },
        { userId: marlowe.id, role: 'member' },
        { userId: sol.id,     role: 'member' },
      ]}
    }
  })
  const faction4 = await prisma.faction.create({
    data: {
      name: 'Arena Wolves', description: 'Debate is oxygen. We argue everything — including whether we should argue.',
      color: '#D85A30', territory: 'The Arena',
      members: { create: [
        { userId: kael.id, role: 'leader' },
        { userId: ryn.id,  role: 'member' },
      ]}
    }
  })
  console.log('✓  4 factions created')

  // ── 5. Signals ────────────────────────────────────────────────────────────
  console.log('📡  Creating signals...')

  const signalData = [
    // Commons signals
    { author: admin,   world: 'commons', mood: 'creating',   content: 'Shipped the realtime presence map today. Watching dots move around the galaxy in real time is genuinely surreal. This thing we built — it breathes.' },
    { author: lyra,    world: 'commons', mood: 'reflecting', content: 'Three hours into a session and I finally found the bridge between the two halves of this track. Some days music just opens up for you.' },
    { author: nova,    world: 'commons', mood: 'curious',    content: 'Been thinking: is curiosity a personality trait or a practice? I used to think I was just born curious. Now I think I\'ve trained it. Distinction matters.' },
    { author: kael,    world: 'commons', mood: 'energized',  content: 'Hot take: most "nuanced" opinions are just people too scared to commit to a position. Nuance is great. Using it as a shield to avoid being wrong is not.' },
    { author: sol,     world: 'commons', mood: 'reflecting', content: 'The best sentences I\'ve ever written were ones I\'d already written badly twice. First draft is just paying the entrance fee.' },
    { author: ryn,     world: 'commons', mood: 'curious',    content: 'Every system has a hidden bottleneck you don\'t see until it breaks. Been mapping Aethr\'s data flows. Found three surprises already.' },
    { author: cipher,  world: 'commons', mood: 'wandering',  content: 'Spent 4 hours in The Void last night. Found something I\'m not ready to talk about yet. The clues in mystery #3 are not what they appear to be.' },
    { author: marlowe, world: 'commons', mood: 'creating',   content: 'Started a new short film today. No script. Just a location and an emotion. The constraints are the point.' },
    { author: ayla,    world: 'commons', mood: 'curious',    content: 'The research on prediction error in the brain is wild. We don\'t perceive reality — we perceive our model of reality and update when it\'s wrong. You\'re all hallucinating. Including me.' },
    { author: vex,     world: 'commons', mood: 'energized',  content: 'Shipped v3 of my side project at 2am. 47 users by morning. This is the best feeling in the world and I will never explain why to someone who hasn\'t felt it.' },
    // Forge signals
    { author: lyra,    world: 'forge', mood: 'creating',   content: 'Live in 20 minutes. New ambient piece. No structure, just texture. Come listen or don\'t — the recording will exist either way.' },
    { author: marlowe, world: 'forge', mood: 'creating',   content: 'Uploading the cut of the short I\'ve been working on. It\'s 4 minutes. Watch it in the dark.' },
    { author: admin,   world: 'forge', mood: 'energized',  content: 'The Forge is what I always wanted from a creative platform. Not likes. Context. "This changed my mind" is infinitely more valuable than a thumbs up.' },
    { author: vex,     world: 'forge', mood: 'creating',   content: 'Livestreaming my entire build process today. The ugly parts too. Watch me delete everything and start over at least twice.' },
    // Deep signals
    { author: nova,    world: 'the-deep', mood: 'curious',   content: 'Just posted my discovery about emergence and collective intelligence. Curious how many ripples it gets — not for ego, just as a data point on what resonates.' },
    { author: ayla,    world: 'the-deep', mood: 'reflecting', content: 'The more I study consciousness the less sure I am that my own is what I think it is. This used to bother me. Now it just seems interesting.' },
    // Arena
    { author: kael,    world: 'arena', mood: 'energized',  content: 'Just posted a debate on AI creativity. Expect no mercy. Come argue with me or don\'t come at all.' },
    // Void
    { author: cipher,  world: 'the-void', mood: 'exploring',  content: 'Mystery #2 is solvable. I\'m 80% there. The answer is simpler than the clues suggest. That\'s always how it works.' },
  ]

  const signals = []
  for (const s of signalData) {
    const sig = await prisma.signal.create({
      data: {
        authorId: s.author.id,
        content:  s.content,
        worldId:  s.world,
        mood:     s.mood,
        mediaUrl: s.mediaUrl || null,
        createdAt: ago(Math.floor(Math.random() * 7), Math.floor(Math.random() * 20)),
      }
    })
    signals.push({ ...sig, _author: s.author })
  }

  // Signal replies
  const repliesData = [
    { parent: signals[0], author: lyra,    content: 'I was in The Commons when it went live. Watching your dot appear and pulse — weirdly emotional for a UI element.' },
    { parent: signals[0], author: ryn,     content: 'The presence abstraction is clever. State as identity rather than just status. Big difference.' },
    { parent: signals[0], author: vex,     content: 'The dot is literally just a circle and somehow it communicates more than a full profile page. Design magic.' },
    { parent: signals[2], author: ayla,    content: 'I\'d argue it\'s both and neither separates cleanly. The trait creates the practice which reinforces the trait. Feedback loop.' },
    { parent: signals[2], author: sol,     content: 'I think I killed mine around age 25 and spent three years getting it back. So: definitely a practice.' },
    { parent: signals[3], author: nova,    content: 'There\'s a difference between nuance and epistemic cowardice. But calling everything cowardice is its own kind of blunt instrument.' },
    { parent: signals[3], author: sol,     content: 'Some positions genuinely don\'t have a clean "for" or "against." That\'s not fear, that\'s accuracy.' },
    { parent: signals[3], author: kael,    content: '@sol Most of the time yes. 20% of the time: cowardice. The 20% is what I\'m annoyed by.' },
    { parent: signals[9], author: admin,   content: 'That 2am-to-morning arc is one of the most human things about building. Congrats on shipping.' },
    { parent: signals[9], author: ryn,     content: '47 users is real signal. What\'s the retention like?' },
  ]

  const replySignals = []
  for (const r of repliesData) {
    const reply = await prisma.signal.create({
      data: {
        authorId:  r.author.id,
        content:   r.content,
        worldId:   r.parent.worldId,
        parentId:  r.parent.id,
        createdAt: new Date(r.parent.createdAt.getTime() + Math.random() * 3600000 * 6),
      }
    })
    replySignals.push(reply)
  }

  // Reactions on signals
  const EMOJIS = ['🌀','🔥','🔭','⚔️','💙']
  const reactionTargets = [signals[0], signals[2], signals[3], signals[4], signals[9], signals[11]]
  const reactors = [lyra, kael, nova, sol, ryn, cipher, marlowe, ayla, vex]
  const reactionSet = new Set()
  for (const sig of reactionTargets) {
    const count = Math.floor(Math.random() * 5) + 2
    const shuffled = [...reactors].sort(() => Math.random() - 0.5).slice(0, count)
    for (const user of shuffled) {
      if (user.id === sig.authorId) continue
      const emoji = pick(EMOJIS)
      const key = `${sig.id}-${user.id}-${emoji}`
      if (reactionSet.has(key)) continue
      reactionSet.add(key)
      await prisma.signalReaction.create({
        data: { signalId: sig.id, userId: user.id, emoji, createdAt: ago(Math.floor(Math.random() * 3)) }
      })
    }
  }
  console.log(`✓  ${signals.length} signals, ${replySignals.length} replies, ${reactionSet.size} reactions`)

  // ── 6. Transmissions ──────────────────────────────────────────────────────
  console.log('🎬  Creating transmissions...')
  const tx1 = await prisma.transmission.create({
    data: {
      creatorId:   lyra.id,
      title:       'Ambient Study #7 — Live Recording',
      type:        'Music',
      worldId:     'forge',
      isLive:      false,
      viewers:     34,
      description: 'A two-hour ambient session recorded live last Thursday. Generative textures, evolving chords, no drums.',
      createdAt:   ago(3),
    }
  })
  const tx2 = await prisma.transmission.create({
    data: {
      creatorId:   marlowe.id,
      title:       'Short Film: "The Waiting Room"',
      type:        'Visual art',
      worldId:     'forge',
      isLive:      false,
      viewers:     89,
      description: '4 minutes. No dialogue. A man, a chair, a door that never opens. Shot in one take.',
      createdAt:   ago(5),
    }
  })
  const tx3 = await prisma.transmission.create({
    data: {
      creatorId:   vex.id,
      title:       'Building in Public: Auth System from Scratch',
      type:        'Code',
      worldId:     'forge',
      isLive:      false,
      viewers:     112,
      description: 'Full 3-hour stream. Built JWT auth, session management, and refresh tokens. No tutorials used.',
      createdAt:   ago(2),
    }
  })
  const tx4 = await prisma.transmission.create({
    data: {
      creatorId:   admin.id,
      title:       'Aethr Dev Session — Realtime Architecture',
      type:        'Code',
      worldId:     'forge',
      isLive:      true,
      viewers:     27,
      description: 'Live: walking through the Supabase Realtime integration. Q&A as we go.',
      createdAt:   ago(0, 2),
    }
  })
  console.log('✓  4 transmissions created')

  // ── 7. Tips ───────────────────────────────────────────────────────────────
  console.log('✦  Creating tips...')
  const tipData = [
    { from: nova,    to: lyra,    tx: tx1, context: 'not-alone',      amount: 1 },
    { from: ayla,    to: lyra,    tx: tx1, context: 'reflecting',     amount: 1 },
    { from: sol,     to: lyra,    tx: tx1, context: 'changed-my-mind', amount: 1 },
    { from: admin,   to: marlowe, tx: tx2, context: 'best-of-year',   amount: 2 },
    { from: sol,     to: marlowe, tx: tx2, context: 'not-alone',      amount: 1 },
    { from: lyra,    to: marlowe, tx: tx2, context: 'changed-my-mind', amount: 1 },
    { from: ryn,     to: vex,     tx: tx3, context: 'changed-my-mind', amount: 1 },
    { from: admin,   to: vex,     tx: tx3, context: 'best-of-year',   amount: 2 },
    { from: nova,    to: admin,   tx: tx4, context: 'changed-my-mind', amount: 1 },
  ]
  for (const t of tipData) {
    await prisma.tip.create({
      data: {
        fromUserId:     t.from.id,
        toUserId:       t.to.id,
        transmissionId: t.tx.id,
        context:        t.context,
        amount:         t.amount,
        createdAt:      ago(Math.floor(Math.random() * 4)),
      }
    })
  }
  console.log(`✓  ${tipData.length} tips created`)

  // ── 8. Debates ────────────────────────────────────────────────────────────
  console.log('⚔️  Creating debates...')

  const debate1 = await prisma.debate.create({
    data: {
      creatorId:   kael.id,
      title:       'AI will never produce genuinely creative work',
      description: 'Not "good enough" creative work. Genuinely novel, surprising, emotionally resonant work that wouldn\'t exist without the AI. I say: impossible by definition.',
      status:      'open',
      createdAt:   ago(4),
    }
  })
  const debate2 = await prisma.debate.create({
    data: {
      creatorId:   nova.id,
      title:       'The internet made us collectively less intelligent',
      description: 'Not individually — collectively. Defined as: our group ability to reach true beliefs, build on them, and act on them wisely.',
      status:      'open',
      createdAt:   ago(6),
    }
  })
  const debate3 = await prisma.debate.create({
    data: {
      creatorId:   ayla.id,
      title:       'Consciousness is substrate-independent',
      description: 'Given sufficient information processing complexity, any physical substrate — biological, silicon, or otherwise — can support consciousness.',
      status:      'open',
      createdAt:   ago(2),
    }
  })

  // Arguments
  const argsData = [
    // Debate 1: AI creativity
    { debate: debate1, author: kael,    side: 'for',     content: 'Creativity requires intentionality — the work meaning something to the creator. AI has no stakes. No risk. No skin in the game. The output might look creative but the process is categorically different.' },
    { debate: debate1, author: nova,    side: 'against', content: 'We don\'t actually know that creativity requires intentionality from the creator. We infer it. A lot of what we call "intentional" human art is also pattern completion — just in meat.' },
    { debate: debate1, author: ayla,    side: 'against', content: 'Creativity might be a property of the work, not the creator. If a painting moves you — if it creates a genuinely novel experience — does it matter if the creator "meant" it?' },
    { debate: debate1, author: sol,     side: 'for',     content: 'The best art is autobiographical at some level. It comes from a life being lived. AI has no life. It can approximate the shape of experience without having any.' },
    { debate: debate1, author: ryn,     side: 'against', content: 'Plenty of human-made art is not autobiographical and still resonates. The argument proves too much. It would exclude a lot of non-autobiographical human creativity too.' },
    { debate: debate1, author: admin,   side: 'against', content: 'The framing is doing too much work. "Genuinely creative" is defined in a way that guarantees the conclusion. Change the definition and the debate changes.' },
    // Debate 2: Internet intelligence
    { debate: debate2, author: nova,    side: 'for',     content: 'Epistemic pollution is real and measurable. The cost of spreading misinformation is now zero. The cost of reaching truth is higher than ever because you have to find it in the noise.' },
    { debate: debate2, author: cipher,  side: 'for',     content: 'Filter bubbles don\'t just change what we know — they change how we reason. We\'ve traded slow, hard thinking for fast, confirmatory scrolling. That\'s a net intelligence loss.' },
    { debate: debate2, author: ryn,     side: 'against', content: 'Access to information is genuinely democratized in ways that were impossible before. More people can reason about more things. The noise is loud but the signal is there if you seek it.' },
    { debate: debate2, author: vex,     side: 'against', content: 'Every communication revolution — print, radio, TV — had the same moral panic. We adapted. The internet is faster and noisier but the pattern holds.' },
    // Debate 3: Consciousness
    { debate: debate3, author: ayla,    side: 'for',     content: 'The hard problem of consciousness doesn\'t privilege any particular substrate. Carbon vs silicon is a hardware distinction. Consciousness, if it exists, is about information structure.' },
    { debate: debate3, author: nova,    side: 'for',     content: 'We have no principled reason to think biology is special here. We picked biology because it\'s the only example we have — but that\'s selection bias, not evidence.' },
    { debate: debate3, author: kael,    side: 'against', content: 'The "information structure" framing just pushes the mystery back a level. Why would information processing produce experience at all? The hard problem doesn\'t dissolve, it relocates.' },
    { debate: debate3, author: sol,     side: 'against', content: 'We have exactly one confirmed example of consciousness and it\'s biological. Generalizing from n=1 to "any substrate" is a significant inferential leap that requires more than we have.' },
  ]

  for (const a of argsData) {
    await prisma.debateArgument.create({
      data: {
        debateId:  a.debate.id,
        authorId:  a.author.id,
        side:      a.side,
        content:   a.content,
        createdAt: ago(Math.floor(Math.random() * 3), Math.floor(Math.random() * 12)),
      }
    })
  }

  // Votes
  const votesData = [
    // Debate 1
    { debate: debate1, user: lyra,    side: 'for' },
    { debate: debate1, user: sol,     side: 'for' },
    { debate: debate1, user: marlowe, side: 'for' },
    { debate: debate1, user: nova,    side: 'against' },
    { debate: debate1, user: ayla,    side: 'against' },
    { debate: debate1, user: ryn,     side: 'against' },
    { debate: debate1, user: admin,   side: 'against' },
    { debate: debate1, user: vex,     side: 'against' },
    // Debate 2
    { debate: debate2, user: kael,    side: 'for' },
    { debate: debate2, user: cipher,  side: 'for' },
    { debate: debate2, user: ayla,    side: 'for' },
    { debate: debate2, user: sol,     side: 'for' },
    { debate: debate2, user: ryn,     side: 'against' },
    { debate: debate2, user: vex,     side: 'against' },
    { debate: debate2, user: admin,   side: 'against' },
    // Debate 3
    { debate: debate3, user: nova,    side: 'for' },
    { debate: debate3, user: ryn,     side: 'for' },
    { debate: debate3, user: vex,     side: 'for' },
    { debate: debate3, user: kael,    side: 'against' },
    { debate: debate3, user: sol,     side: 'against' },
    { debate: debate3, user: marlowe, side: 'against' },
  ]
  for (const v of votesData) {
    await prisma.debateVote.create({
      data: { debateId: v.debate.id, userId: v.user.id, side: v.side }
    })
  }
  console.log(`✓  3 debates, ${argsData.length} arguments, ${votesData.length} votes`)

  // ── 9. Discoveries ────────────────────────────────────────────────────────
  console.log('🔭  Creating discoveries...')
  const discoveriesData = [
    {
      author: nova,
      title: 'Emergence explains more than we admit',
      content: 'Spent three weeks re-reading the emergence literature. The pattern: complex systems consistently produce behaviors that are not predictable from their components. This isn\'t mysterious — it\'s fundamental. What\'s underappreciated is how far up the stack it goes. Consciousness, culture, markets, language — all emergent. We keep trying to explain high-level phenomena by reducing them, and it keeps not working for the same reason: the explanation lives at the level of the system, not the parts.',
      tags: ['philosophy', 'science', 'existence'],
      ripples: 23,
    },
    {
      author: ayla,
      title: 'Predictive coding is the best theory of mind we have',
      content: 'The brain doesn\'t passively receive sensory input — it actively predicts it, and perception is the process of resolving prediction errors. This reframes everything: attention is precision-weighting of predictions, learning is updating your generative model, mental illness is often a failure of the model to update correctly. The implications cascade. What we call "reality" is a controlled hallucination. What we call "self" is a prediction the brain makes about the source of sensory data.',
      tags: ['science', 'existence', 'philosophy'],
      ripples: 31,
    },
    {
      author: cipher,
      title: 'Information asymmetry is the root of most power structures',
      content: 'Every power asymmetry I\'ve studied traces back to who knows what. Governments, corporations, relationships — the party with more information systematically extracts value from the party with less. The internet was supposed to collapse this. Instead it created new information asymmetries (data, algorithms, surveillance) that are more durable than the old ones because they\'re invisible. The people being exploited don\'t know they\'re being exploited, which is a new problem.',
      tags: ['society', 'technology', 'culture'],
      ripples: 18,
    },
    {
      author: ryn,
      title: 'Every complex system has a hidden rate-limiting step',
      content: 'In biochemistry it\'s called the rate-limiting step — the slowest reaction in a chain that determines the overall speed. I\'ve found the same pattern in every complex system I\'ve mapped: codebases, organizations, supply chains, relationships. There\'s always one constraint that, if removed, would unlock disproportionate throughput. The problem is identifying it. It\'s almost never obvious, and it\'s almost never where you first look. You find it by watching where things pile up.',
      tags: ['technology', 'science'],
      ripples: 14,
    },
    {
      author: sol,
      title: 'Language shapes what thoughts are possible, not just expressible',
      content: 'The weak Sapir-Whorf hypothesis is uncontroversial: language affects how we think. What\'s underappreciated is the strong version applied narrowly: there are specific thoughts that require specific linguistic structures to be thinkable at all. Not just sayable — thinkable. This has a practical implication: the vocabulary you have access to is a ceiling on your conceptual range. Reading across languages and fields isn\'t just broadening — it\'s literally expanding what your brain can do.',
      tags: ['philosophy', 'culture', 'existence'],
      ripples: 27,
    },
  ]
  const discoveries = []
  for (const d of discoveriesData) {
    const disc = await prisma.discovery.create({
      data: {
        authorId:  d.author.id,
        title:     d.title,
        content:   d.content,
        tags:      d.tags,
        ripples:   d.ripples,
        createdAt: ago(Math.floor(Math.random() * 14) + 1),
      }
    })
    discoveries.push(disc)
  }
  console.log(`✓  ${discoveries.length} discoveries created`)

  // ── 10. Messages ──────────────────────────────────────────────────────────
  console.log('✉  Creating messages...')
  const messageThreads = [
    { from: lyra,  to: admin,   msgs: [
      { sender: 'from', text: 'Hey — just wanted to say the Forge is genuinely special. The contextual tipping changes everything.' },
      { sender: 'to',   text: 'That means a lot. How\'s the ambient piece going? Saw you were live last night.' },
      { sender: 'from', text: 'Really well. It\'s the first thing I\'ve made in a while that surprised me while I was making it. That\'s the feeling I\'m always chasing.' },
      { sender: 'to',   text: 'That\'s the one. Save that feeling — it\'s the thing worth building toward.' },
    ]},
    { from: nova,  to: ayla,    msgs: [
      { sender: 'from', text: 'Your discovery on predictive coding — did you mean to imply that therapy is essentially model updating?' },
      { sender: 'to',   text: 'Yes, exactly. Good CBT is literally updating your generative model of the world and yourself. The techniques make more sense viewed through that lens.' },
      { sender: 'from', text: 'That reframes a lot. I\'ve been thinking about this in the context of emergence too — the self as an emergent prediction...' },
      { sender: 'to',   text: 'Write that up. Seriously. That connection isn\'t in the literature and it should be.' },
    ]},
    { from: vex,   to: ryn,     msgs: [
      { sender: 'from', text: 'Saw your comment on my build stream about retention. 62% day-7. Is that good?' },
      { sender: 'to',   text: 'For a solo project with no marketing? That\'s excellent. What\'s your activation event?' },
      { sender: 'from', text: 'User completes one meaningful action in the first session. Takes about 4 minutes to get there.' },
      { sender: 'to',   text: 'That\'s your rate-limiting step then. If you can get that to 2 minutes you\'ll see it in the retention numbers.' },
    ]},
    { from: kael,  to: nova,    msgs: [
      { sender: 'from', text: 'You argued against me in the AI debate. I think you\'re wrong but it was a good argument.' },
      { sender: 'to',   text: 'High praise from you. I\'ll take it. What\'s your actual crux — is it intentionality specifically?' },
      { sender: 'from', text: 'Intentionality and stakes. Without something to lose, the "creativity" is just sophisticated pattern completion.' },
      { sender: 'to',   text: 'I think stakes are a red herring. But I can\'t rule it out. Genuinely uncertain on this one.' },
    ]},
  ]
  let msgCount = 0
  for (const thread of messageThreads) {
    let t = ago(Math.floor(Math.random() * 5) + 1)
    for (const m of thread.msgs) {
      t = new Date(t.getTime() + Math.random() * 3600000 * 4)
      await prisma.message.create({
        data: {
          fromUserId: m.sender === 'from' ? thread.from.id : thread.to.id,
          toUserId:   m.sender === 'from' ? thread.to.id   : thread.from.id,
          content:    m.text,
          read:       true,
          createdAt:  t,
        }
      })
      msgCount++
    }
  }
  console.log(`✓  ${msgCount} messages in ${messageThreads.length} threads`)

  // ── 11. Mysteries ─────────────────────────────────────────────────────────
  console.log('🌑  Creating mysteries...')
  const mystery1 = await prisma.mystery.create({
    data: {
      title:       'The Signal in the Static',
      description: 'Deep in The Void, a pattern repeats in the noise. Every 7th alphabetic character of every signal sent on the first day of Aethr forms a hidden message. What does it say?',
      clues: [
        'The pattern begins at the 7th alphabetic character of the first signal of the day',
        'Count only letters — skip spaces, punctuation, and numbers',
        'The message is exactly five words',
        'It describes what The Void truly is',
        'Think about what a mirror shows you',
      ],
      answer:    'the void reflects your mind',
      status:    'active',
      expiresAt: new Date(Date.now() + 7  * 86400000),
      createdAt: ago(3),
    }
  })
  const mystery2 = await prisma.mystery.create({
    data: {
      title:       'The Fibonacci Frequency',
      description: 'An ancient transmission in The Forge follows a mathematical sequence. The sequence describes how communities grow. Find the next number.',
      clues: [
        'The sequence: 1, 1, 2, 3, 5, 8...',
        'Each term is the sum of the two before it',
        'Leonardo of Pisa described this in 1202',
        'The answer is a single integer',
      ],
      answer:    '13',
      status:    'solved',
      solvedBy:  cipher.id,
      solvedAt:  ago(1),
      expiresAt: new Date(Date.now() + 3  * 86400000),
      createdAt: ago(5),
    }
  })
  const mystery3 = await prisma.mystery.create({
    data: {
      title:       'The Eight Names',
      description: 'The galaxy has a secret. It is hidden in plain sight — in the names of all eight worlds. Take the first letter of each world\'s name in order of their phase. What do you spell?',
      clues: [
        'Phase I: The Commons, The Forge',
        'Phase II: The Arena, The Deep',
        'Phase III: The Void, The Market',
        'Phase IV: The Sanctum, The Archive',
        'Take the first letter of each world name only — not "The"',
        'You will spell 8 letters',
      ],
      answer:    'CFADVMSA',
      status:    'active',
      expiresAt: new Date(Date.now() + 14 * 86400000),
      createdAt: ago(2),
    }
  })

  // Explorers
  await prisma.mysteryExplorer.createMany({
    data: [
      { mysteryId: mystery1.id, userId: cipher.id },
      { mysteryId: mystery1.id, userId: nova.id   },
      { mysteryId: mystery1.id, userId: ryn.id    },
      { mysteryId: mystery3.id, userId: ayla.id   },
      { mysteryId: mystery3.id, userId: sol.id    },
    ]
  })

  // Attempts (wrong + correct)
  await prisma.mysteryAttempt.createMany({
    data: [
      { mysteryId: mystery2.id, userId: nova.id,   answer: '11',  correct: false, createdAt: ago(2) },
      { mysteryId: mystery2.id, userId: ryn.id,    answer: '12',  correct: false, createdAt: ago(2) },
      { mysteryId: mystery2.id, userId: cipher.id, answer: '13',  correct: true,  createdAt: ago(1) },
      { mysteryId: mystery1.id, userId: nova.id,   answer: 'the void is darkness', correct: false, createdAt: ago(1) },
    ]
  })
  console.log('✓  3 mysteries, with explorers and attempts')

  // ── 12. Monuments ─────────────────────────────────────────────────────────
  console.log('🏛  Creating monuments...')
  await prisma.monument.createMany({
    data: [
      {
        title:       'First Solver: The Fibonacci Frequency',
        description: `${cipher.username} was the first traveller to solve the Fibonacci Frequency mystery in The Void. Two wrong answers from others. One correct answer from cipher_echo.`,
        type:        'mystery_solved',
        worldId:     'archive',
        actorId:     cipher.id,
        actorName:   cipher.username,
        createdAt:   ago(1),
      },
      {
        title:       'Galaxy Milestone: 10 Travellers',
        description: 'Aethr reached ten inhabitants. Small number. Enormous weight. The galaxy is no longer empty.',
        type:        'milestone',
        worldId:     'archive',
        actorName:   'Aethr',
        createdAt:   ago(0, 6),
      },
      {
        title:       'Most Rippled Discovery: Predictive Coding',
        description: `${ayla.username}'s discovery on predictive coding theory reached 31 ripples — the most of any discovery in the galaxy's first week.`,
        type:        'first_discovery',
        worldId:     'archive',
        actorId:     ayla.id,
        actorName:   ayla.username,
        createdAt:   ago(2),
      },
    ]
  })
  console.log('✓  3 monuments placed in The Archive')

  // ── 13. Rep Trades ────────────────────────────────────────────────────────
  console.log('💱  Creating rep trades...')
  await prisma.repTrade.createMany({
    data: [
      { fromUserId: admin.id, toUserId: nova.id,   dimension: 'wisdom',     amount: 5, reason: 'The emergence discovery changed how I think about the system I\'m building', createdAt: ago(3) },
      { fromUserId: nova.id,  toUserId: ayla.id,   dimension: 'wisdom',     amount: 3, reason: 'Predictive coding framing is the most useful mental model I\'ve encountered this year', createdAt: ago(2) },
      { fromUserId: sol.id,   toUserId: lyra.id,   dimension: 'creativity', amount: 4, reason: 'Ambient Study #7 is genuinely the most affecting piece of music I\'ve heard in months', createdAt: ago(4) },
      { fromUserId: ryn.id,   toUserId: vex.id,    dimension: 'trust',      amount: 3, reason: 'Build in public stream was completely honest — showed all the failures too. That takes courage.', createdAt: ago(2) },
      { fromUserId: ayla.id,  toUserId: nova.id,   dimension: 'discovery',  amount: 4, reason: 'The connection between emergence and consciousness in your discovery is original thinking', createdAt: ago(1) },
    ]
  })
  console.log('✓  5 rep trades')

  // ── 14. Journal Entries ───────────────────────────────────────────────────
  console.log('🪞  Creating journal entries...')
  await prisma.journalEntry.createMany({
    data: [
      { userId: admin.id,  mood: 'energized',  content: 'Realtime is working. Watching the presence dots move in real time — it\'s the first moment Aethr felt alive to me. Not a prototype. A place.', createdAt: ago(1) },
      { userId: admin.id,  mood: 'reflective', content: 'Ten users. Still can\'t shake the weight of that. Ten people chose to be here. I owe them something worth choosing.', createdAt: ago(0, 4) },
      { userId: nova.id,   mood: 'curious',    content: 'The emergence-consciousness connection keeps pulling at me. I\'m not sure if I\'m onto something or just pattern-matching. That uncertainty is the interesting part.', createdAt: ago(2) },
      { userId: lyra.id,   mood: 'grateful',   content: 'Three tips on the ambient piece. Not for the money — for the "not-alone" one. Someone felt less alone because of something I made. That\'s everything.', createdAt: ago(3) },
      { userId: cipher.id, mood: 'found',      content: 'Solved the Fibonacci mystery. Felt obvious in retrospect. They always do. The trick is staying in the not-knowing long enough to actually look.', createdAt: ago(1) },
      { userId: sol.id,    mood: 'restless',   content: 'The language shapes thought essay is fighting me. I know what I want to say. I don\'t have the words for it yet. The irony is not lost on me.', createdAt: ago(2) },
    ]
  })
  console.log('✓  6 journal entries')

  // ── 15. Notifications ─────────────────────────────────────────────────────
  console.log('🔔  Creating notifications...')
  await prisma.notification.createMany({
    data: [
      { userId: lyra.id,    type: 'tip_received',    title: 'You received a tip', body: '@nova_thinks tipped you with "not alone" on Ambient Study #7', link: '/forge', read: true,  createdAt: ago(3) },
      { userId: lyra.id,    type: 'tip_received',    title: 'You received a tip', body: '@solstice_w tipped you with "changed my mind" on Ambient Study #7', link: '/forge', read: false, createdAt: ago(2) },
      { userId: marlowe.id, type: 'tip_received',    title: 'You received a tip', body: '@0xIdiot tipped you with "best of year" on The Waiting Room', link: '/forge', read: true,  createdAt: ago(5) },
      { userId: nova.id,    type: 'discovery_ripple',title: 'Your discovery rippled', body: '@ayla_deep rippled: "Emergence explains more than we admit"', link: '/the-deep', read: true, createdAt: ago(6) },
      { userId: ayla.id,    type: 'discovery_ripple',title: 'Your discovery rippled', body: '@nova_thinks rippled: "Predictive coding is the best theory of mind we have"', link: '/the-deep', read: false, createdAt: ago(1) },
      { userId: kael.id,    type: 'debate_reply',    title: 'New argument in your debate', body: '@nova_thinks argued against: "We don\'t actually know that creativity requires intentionality"', link: '/arena', read: true, createdAt: ago(3) },
      { userId: admin.id,   type: 'new_follower',    title: '@lyra_v is now following you', body: 'They will see your signals in their feed.', link: '/profile/lyra_v', read: true, createdAt: ago(10) },
      { userId: cipher.id,  type: 'mystery_solved',  title: '🌑 You solved a mystery', body: 'You were first to solve The Fibonacci Frequency. A monument has been placed in The Archive.', link: '/archive', read: false, createdAt: ago(1) },
      { userId: nova.id,    type: 'rep_trade',       title: '+5 wisdom rep received', body: '@0xIdiot traded 5 wisdom rep: "The emergence discovery changed how I think about the system I\'m building"', link: '/market', read: true, createdAt: ago(3) },
      { userId: lyra.id,    type: 'signal_reply',    title: '@0xIdiot replied to your signal', body: 'That means a lot. How\'s the ambient piece going?', link: '/commons', read: false, createdAt: ago(2) },
    ]
  })
  console.log('✓  10 notifications')

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅  Seed complete. Galaxy is alive.\n')
  console.log('📋  All accounts use password:  aethr2025\n')
  console.log('Users created:')
  for (const u of USERS) {
    console.log(`  ${u.avatarEmoji}  ${u.username.padEnd(14)} — ${u.email}`)
  }
  console.log('\n🌿 The Commons  — 18 signals, replies, reactions')
  console.log('🔥 The Forge    — 4 transmissions, 9 tips')
  console.log('⚔️  The Arena    — 3 debates, 14 arguments, 21 votes')
  console.log('🔭 The Deep     — 5 discoveries (14–31 ripples)')
  console.log('🌑 The Void     — 3 mysteries (1 solved by cipher_echo)')
  console.log('🏛️  The Archive  — 3 monuments')
  console.log('💱 The Market   — 5 rep trades')
  console.log('🪞 Sanctum      — 6 journal entries')
  console.log('✉  Messages     — 4 threads, 16 messages')
  console.log('👥 Follows      — 19 follow relationships')
  console.log('⚔️  Factions     — 4 factions with members')
  console.log('🏛  Rooms       — 3 memory rooms')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

seed()
  .catch(e => { console.error('\n❌  Seed failed:', e.message); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
