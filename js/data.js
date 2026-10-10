window.LG_DATA = {
  START_CASH: 80,
  DEBT: 520,
  WEEK_LEN: 28,
  SLOTS: ["morning", "afternoon", "evening", "night"],
  HIMARI_NIGHT_ASK_DAYS: [6, 10, 18, 22, 24], // SOTA WIRE 2026-10-09: first night out D2 -> D6
  BOSS_PEEK_NIGHT_DAYS: [3, 5, 7, 9, 11, 17, 19, 21],
  JOBS: [
    { id: "floor", minInt: 0, name: "Temp", grey: 35, green: 55, blue: 75 },
    { id: "ex", minInt: 5, name: "Analyst", grey: 61, green: 96, blue: 131 },
    { id: "lead", minInt: 20, name: "Lead", grey: 107, green: 168, blue: 229 },
    { id: "ops", minInt: 50, name: "Director", grey: 187, green: 294, blue: 401 }
  ],
  SETS: {
    d3: {
      id: "SCENE_BOSS_WORKAREA_BJ",
      count: 5,
      where: "her_office",
      from: "her_warehouse",
      door: "office",
      label: "Office door"
    },
    d5: {
      id: "SCENE_BOSS_LOCKER_BATHROOM_RIDE",
      count: 5,
      where: "gym_locker",
      from: "gym_hall",
      door: "women's locker room",
      label: "Locker door"
    },
    d7: {
      id: "SCENE_BOSS_FINAL_MISSIONARY",
      count: 5,
      where: "home_bed",
      from: "home_living",
      door: "bedroom",
      label: "Bedroom door"
    },
    b4: {
      id: "SCENE_BOSS_WORKAREA_RIDE",
      count: 3,
      where: "her_office",
      from: "her_warehouse",
      door: "office",
      label: "Office door"
    },
    b5: {
      id: "SCENE_BOSS_WORKAREA_SPOON",
      count: 5,
      where: "her_office",
      from: "her_warehouse",
      door: "office",
      label: "Office door"
    },
    b6: {
      id: "SCENE_BOSS_LOCKER_MATEPRESS",
      count: 3,
      where: "gym_locker",
      from: "gym_hall",
      door: "women's locker room",
      label: "Locker door"
    },
    b7: {
      id: "SCENE_BOSS_LOCKER_MISSIONARY",
      count: 4,
      where: "gym_locker",
      from: "gym_hall",
      door: "women's locker room",
      label: "Locker door"
    },
    b8: {
      id: "SCENE_BOSS_FINAL_DOGGY",
      count: 4,
      where: "home_bed",
      from: "home_living",
      door: "bedroom",
      label: "Bedroom door"
    },
    e1: {
      id: "SCENE_BOSS_FINAL_COWGIRL",
      count: 4,
      where: "work",
      from: "work_out",
      door: "office",
      label: "Office door"
    },
    e2: {
      id: "SCENE_BOSS_OFFICE_RD_DOGGY",
      count: 6,
      where: "her_office",
      from: "her_warehouse",
      door: "office",
      label: "Office door"
    },
    e3: {
      id: "SCENE_BOSS_FINAL_SUCK",
      count: 1,
      where: "home_bed",
      from: "home_living",
      door: "bedroom",
      label: "Bedroom door"
    },
    sota1: {
      id: "SCENE_JAKE_TVRACK_STANDING",
      count: 5,
      where: "sota_apt",
      from: "sota_out",
      door: "Sota's door",
      label: "Neighbor door"
    },
    sota2: {
      id: "SCENE_JAKE_TVRACK_BOUNCE",
      count: 6,
      where: "sota_apt",
      from: "sota_out",
      door: "Sota's door",
      label: "Neighbor door"
    },
    sota3: {
      id: "SCENE_JAKE_COWGIRL",
      count: 5,
      where: "sota_apt",
      from: "sota_out",
      door: "Sota's door",
      label: "Neighbor door"
    },
    bf1: {
      id: "SCENE_JAKE_FINAL_MISSIONARY",
      count: 6,
      where: "home_bed",
      from: "home_living",
      door: "bedroom",
      label: "Bedroom"
    },
    good: {
      id: "SCENE_JAKE_FINAL_MISSIONARY",
      count: 6,
      where: "home_bed",
      from: "home_living",
      door: "bedroom",
      label: "Bedroom door"
    },
    ntr: {
      id: "SCENE_JAKE_FINAL_DOGGY",
      count: 4,
      where: "home_bed",
      from: "home_living",
      door: "bedroom",
      label: "Bedroom door"
    },
    nts: {
      id: "SCENE_JAKE_SHOWER_LEAN",
      count: 5,
      where: "home_bed",
      from: "home_living",
      door: "bedroom",
      label: "Bedroom door"
    },
    gr1: {
      id: "SCENE_JAKE_FINAL_REV_DOGGY",
      count: 3,
      where: "sota_apt",
      from: "sota_out",
      door: "Sota's door",
      label: "Neighbor door",
    },
    gr2: {
      id: "SCENE_JAKE_SHOWER_BEND",
      count: 3,
      where: "sota_apt",
      from: "sota_out",
      door: "Sota's door",
      label: "Neighbor door",
    }
  },
  // M-BATCH 2026-10-06 (#5): placeholder creators removed - Nightly is Mika's page only.
  NIGHTLY_CREATORS: [
    { id: "mika", handle: "@mika", name: "Mika", blurb: "Soft light. Late posts.", persona: "himari" }
  ],
  NIGHTLY_TOYS: { bump: 10, stroke: 25 },
  NIGHTLY_TIP_THRESHOLDS: { 1: 50, 2: 375, 3: 700, 4: 1025, 5: 1350, 6: 1675, 7: 2000 },
  NIGHTLY_HUNTS: [
    {
      id: "hunt_lipstick",
      prop: "prop_lipstick_tissue",
      room: "her_warehouse",
      label: "Pink tissue",
      clue: "Pink smear on a tissue by the warehouse wash station…",
      nightlyTier: 1,
      sourceStem: "SCENE_ROBERT_WORKAREA_BJ",
      stageCount: 4,
      stages: [
      { file: "SCENE_ROBERT_WORKAREA_BJ_1.mp4", funscript: "SCENE_ROBERT_WORKAREA_BJ_1.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_BJ_2.mp4", funscript: "SCENE_ROBERT_WORKAREA_BJ_2.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_BJ_3.mp4", funscript: "SCENE_ROBERT_WORKAREA_BJ_3.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_BJ_4.mp4", funscript: "SCENE_ROBERT_WORKAREA_BJ_4.funscript" }
      ],
      teaser: "nightly_teaser_lipstick",
      full: "nightly_full_lipstick"
    },
    {
      id: "hunt_earring",
      prop: "prop_loose_earring",
      room: "warehouse_elec",
      label: "Loose earring",
      clue: "One earring under the electrical panel latch…",
      nightlyTier: 2,
      sourceStem: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE",
      stageCount: 4,
      stages: [
      { file: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_1.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_1.funscript" },
      { file: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_2.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_2.funscript" },
      { file: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_3.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_3.funscript" },
      { file: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_4.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_COWGIRL_BOUNCE_4.funscript" }
      ],
      teaser: "nightly_teaser_earring",
      full: "nightly_full_earring"
    },
    {
      id: "hunt_keytag",
      prop: "prop_nightly_keytag",
      room: "her_warehouse",
      label: "Neon keytag",
      clue: "A neon keytag caught on a warehouse shelf edge…",
      nightlyTier: 3,
      sourceStem: "SCENE_ROBERT_WORKAREA_SITTING",
      stageCount: 4,
      stages: [
      { file: "SCENE_ROBERT_WORKAREA_SITTING_1.mp4", funscript: "SCENE_ROBERT_WORKAREA_SITTING_1.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_SITTING_2.mp4", funscript: "SCENE_ROBERT_WORKAREA_SITTING_2.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_SITTING_3.mp4", funscript: "SCENE_ROBERT_WORKAREA_SITTING_3.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_SITTING_4.mp4", funscript: "SCENE_ROBERT_WORKAREA_SITTING_4.funscript" }
      ],
      teaser: "nightly_teaser_keytag",
      full: "nightly_full_keytag"
    },
    {
      id: "hunt_bracelet",
      prop: "prop_nightly_bracelet",
      room: "warehouse_elec",
      label: "Bracelet",
      clue: "A thin bracelet by the electrical room gauge bank…",
      nightlyTier: 4,
      sourceStem: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK",
      stageCount: 4,
      stages: [
      { file: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_1.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_1.funscript" },
      { file: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_2.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_2.funscript" },
      { file: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_3.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_3.funscript" },
      { file: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_4.mp4", funscript: "SCENE_ROBERT_ELECTRICAL_BREASTSUCK_4.funscript" }
      ],
      teaser: "nightly_teaser_bracelet",
      full: "nightly_full_bracelet"
    },
    {
      id: "hunt_hair_tie",
      prop: "prop_nightly_hair_tie",
      room: "her_warehouse",
      label: "Hair tie",
      clue: "A hair tie looped on a shelf upright near the standing pad…",
      nightlyTier: 5,
      sourceStem: "SCENE_ROBERT_WORKAREA_STANDING",
      stageCount: 4,
      stages: [
      { file: "SCENE_ROBERT_WORKAREA_STANDING_1.mp4", funscript: "SCENE_ROBERT_WORKAREA_STANDING_1.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_STANDING_2.mp4", funscript: "SCENE_ROBERT_WORKAREA_STANDING_2.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_STANDING_3.mp4", funscript: "SCENE_ROBERT_WORKAREA_STANDING_3.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_STANDING_4.mp4", funscript: "SCENE_ROBERT_WORKAREA_STANDING_4.funscript" }
      ],
      teaser: "nightly_teaser_hair_tie",
      full: "nightly_full_hair_tie"
    },
    {
      id: "hunt_anklet",
      prop: "prop_nightly_anklet",
      room: "home_living",
      label: "Anklet",
      clue: "An anklet under the living-room chair…",
      nightlyTier: 6,
      sourceStem: "SCENE_ROBERT_FINAL_MISSIONARY",
      stageCount: 4,
      stages: [
      { file: "SCENE_ROBERT_FINAL_MISSIONARY_1.mp4", funscript: "SCENE_ROBERT_FINAL_MISSIONARY_1.funscript" },
      { file: "SCENE_ROBERT_FINAL_MISSIONARY_2.mp4", funscript: "SCENE_ROBERT_FINAL_MISSIONARY_2.funscript" },
      { file: "SCENE_ROBERT_FINAL_MISSIONARY_3.mp4", funscript: "SCENE_ROBERT_FINAL_MISSIONARY_3.funscript" },
      { file: "SCENE_ROBERT_FINAL_MISSIONARY_4.mp4", funscript: "SCENE_ROBERT_FINAL_MISSIONARY_4.funscript" }
      ],
      teaser: "nightly_teaser_anklet",
      full: "nightly_full_anklet"
    },
    {
      id: "hunt_compact",
      prop: "prop_nightly_compact",
      room: "her_warehouse",
      label: "Compact",
      clue: "A makeup compact wedged between warehouse boxes…",
      nightlyTier: 7,
      sourceStem: "SCENE_ROBERT_WORKAREA_DOGGY",
      stageCount: 4,
      stages: [
      { file: "SCENE_ROBERT_WORKAREA_DOGGY_1.mp4", funscript: "SCENE_ROBERT_WORKAREA_DOGGY_1.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_DOGGY_2.mp4", funscript: "SCENE_ROBERT_WORKAREA_DOGGY_2.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_DOGGY_3.mp4", funscript: "SCENE_ROBERT_WORKAREA_DOGGY_3.funscript" },
      { file: "SCENE_ROBERT_WORKAREA_DOGGY_4.mp4", funscript: "SCENE_ROBERT_WORKAREA_DOGGY_4.funscript" }
      ],
      teaser: "nightly_teaser_compact",
      full: "nightly_full_compact"
    }
  ],
  NIGHTLY_ENDINGS: [
    {
      id: "ending_robert_tied",
      kind: "tied",
      room: "home_bed",
      hunts: [],
      label: "Tied fantasy",
      dayExact: 26,
      requiresTopFan: true,
      requiresLifetimeTipsGbp: 2000,
      requiresNotAccused: true,
      requiresInviteShowUp: true,
      tipTierThresholdsGbp: { 1: 50, 2: 375, 3: 700, 4: 1025, 5: 1350, 6: 1675, 7: 2000 },
      chain: [
        { sourceStem: "SCENE_ROBERT_FINAL_SUCK", stageCount: 4 },
        { sourceStem: "SCENE_ROBERT_FINAL_RIDE", stageCount: 4 },
        { sourceStem: "SCENE_ROBERT_FINAL_DOGGY", stageCount: 3 }
      ]
    },
    {
      id: "ending_robert_peek_electrical",
      kind: "peek",
      room: "warehouse_elec",
      hunts: [],
      label: "Electrical peek",
      sourceStem: "SCENE_ROBERT_ELECTRICAL_UPWARD_FUCK",
      stageCount: 3
    },
    {
      id: "ending_robert_peek_workarea",
      kind: "peek",
      room: "her_warehouse",
      hunts: [],
      label: "Warehouse peek",
      sourceStem: "SCENE_ROBERT_WORKAREA_DOGGY_BEND",
      stageCount: 4
    }
  ],

  GALLERY_ROUTES: [
    { id: "boss", title: "Kurosawa", sub: "Boss", live: true },
    { id: "jake", title: "Sota", sub: "Neighbor", live: true },
    { id: "carter", title: "Ono", sub: "Industrial", live: false },
    { id: "robert", title: "Shinji", sub: "Warehouse", live: false },
    { id: "nightly", title: "Nightly", sub: "Mika", live: true }
  ],
  GALLERY_BOSS: [
    { kind: "d3", title: "B1 \u00B7 Day 3", sub: "Office" },
    { kind: "d5", title: "B2 \u00B7 Day 5", sub: "Locker" },
    { kind: "d7", title: "B3 \u00B7 Day 7", sub: "Bedroom" },
    { kind: "b4", title: "B4 \u00B7 Day 9", sub: "Office \u00B7 ride" },
    { kind: "b5", title: "B5 \u00B7 Day 11", sub: "Office \u00B7 spoon" },
    { kind: "b6", title: "B6 \u00B7 Day 17", sub: "Locker \u00B7 matepress" },
    { kind: "b7", title: "B7 \u00B7 Day 19 evening", sub: "Locker \u00B7 missionary" },
    { kind: "b8", title: "B8 \u00B7 Day 21", sub: "Bedroom \u00B7 doggy" },
    { kind: "e1", title: "E1 \u00B7 Day 25 night", sub: "Your office \u00B7 cowgirl" },
    { kind: "e2", title: "E2 \u00B7 Day 25 afternoon", sub: "His office \u00B7 doggy" },
    { kind: "e3", title: "E3 \u00B7 Day 25 evening", sub: "Bedroom \u00B7 suck" }
  ],
  GALLERY_SOTA: [
    { kind: "sota1", title: "S1 \u00B7 First night out", sub: "TV rack \u00B7 standing" },
    { kind: "sota2", title: "S2 \u00B7 Second night out", sub: "TV rack \u00B7 bounce" },
    { kind: "sota3", title: "S3 \u00B7 Third night out", sub: "Cowgirl" },
    { kind: "bf1", title: "Home \u00B7 night", sub: "Your bed \u00B7 missionary" },
    { kind: "good", title: "Good \u00B7 Day 25", sub: "Your bed \u00B7 missionary" },
    { kind: "ntr", title: "Netorare \u00B7 Day 25", sub: "Bedroom \u00B7 doggy" },
    { kind: "nts", title: "Netorase \u00B7 Day 25", sub: "Shower \u00B7 lean" },
    { kind: "gr1", title: "Go-round 1", sub: "Reverse doggy" },
    { kind: "gr2", title: "Go-round 2", sub: "Shower bend" }
  ],
  GALLERY: [
    { kind: "d3", title: "B1 \u00B7 Day 3", sub: "Office" },
    { kind: "d5", title: "B2 \u00B7 Day 5", sub: "Locker" },
    { kind: "d7", title: "B3 \u00B7 Day 7", sub: "Bedroom" },
    { kind: "b4", title: "B4 \u00B7 Day 9", sub: "Office \u00B7 ride" },
    { kind: "b5", title: "B5 \u00B7 Day 11", sub: "Office \u00B7 spoon" },
    { kind: "b6", title: "B6 \u00B7 Day 17", sub: "Locker \u00B7 matepress" },
    { kind: "b7", title: "B7 \u00B7 Day 19 evening", sub: "Locker \u00B7 missionary" },
    { kind: "b8", title: "B8 \u00B7 Day 21", sub: "Bedroom \u00B7 doggy" },
    { kind: "e1", title: "E1 \u00B7 Day 25 night", sub: "Your office \u00B7 cowgirl" },
    { kind: "e2", title: "E2 \u00B7 Day 25 afternoon", sub: "His office \u00B7 doggy" },
    { kind: "e3", title: "E3 \u00B7 Day 25 evening", sub: "Bedroom \u00B7 suck" }
  ],
  CLIP_SFX: {
    d3: ["light_sucking.mp3", "deeper_suck.mp3", "faster_deeper_suck.mp3", "faster_deeper_suck.mp3", "suck_cum.mp3"],
    d5: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "sex_cum_2.mp3", "light_panting.mp3"],
    d7: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts_2.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    b4: ["slow_thrusts.mp3", "faster_thrusts.mp3", "sex_cum_2.mp3"],
    b5: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    b6: ["slow_thrusts.mp3", "faster_thrusts.mp3", "sex_cum_2.mp3"],
    b7: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "sex_cum_2.mp3"],
    b8: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts_2.mp3", "sex_cum_2.mp3"],
    e1: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "sex_cum_2.mp3"],
    e2: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts_2.mp3", "sex_cum_2.mp3"],
    e3: ["suck_cum.mp3"],
    sota1: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    sota2: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "faster_thrusts_2.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    sota3: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    bf1: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "faster_thrusts_2.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    good: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "faster_thrusts_2.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    ntr: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts_2.mp3", "sex_cum_2.mp3"],
    nts: ["slow_thrusts.mp3", "light_thrusting.mp3", "faster_thrusts.mp3", "heavy_panting.mp3", "sex_cum_2.mp3"],
    gr1: ["slow_thrusts.mp3", "faster_thrusts.mp3", "sex_cum_2.mp3"],
    gr2: ["slow_thrusts.mp3", "faster_thrusts.mp3", "sex_cum_2.mp3"]
  },
  ROOMS: {
    hub: { name: "City", kind: "hub", bg: "art/bg_city.jpg", exits: [] },
    apt_block: {
      name: "Apartment block", pin: "Home", bg: "art/bg_apt_block_out.jpg",
      exits: ["hub", "home_living"]
    },
    home_living: {
      name: "Living room", pin: "Home", bg: "art/bg_apartment.jpg",
      exits: ["apt_block", "home_bed"]
    },
    home_bed: {
      name: "Bedroom", pin: "Home", bg: "art/bg_bedroom.jpg",
      exits: ["home_living"]
    },
    cafe: {
      name: "Cafe", pin: "Date", bg: "art/bg_cafe.jpg",
      exits: ["hub"]
    },
    warehouse_out: {
      name: "Warehouse lot", pin: "Her work", bg: "art/bg_warehouse_out.jpg",
      exits: ["hub", "her_warehouse"],
      closed: "It's closed. Himari must be at home."
    },
    her_warehouse: {
      name: "Warehouse floor", pin: "Her work", bg: "art/bg_warehouse.jpg",
      exits: ["warehouse_out", "her_office", "warehouse_elec"]
    },
    warehouse_elec: {
      name: "Electrical room", pin: "Her work", bg: "art/bg_electrical.jpg",
      exits: ["her_warehouse"]
    },
    her_office: {
      name: "Office", pin: "Her work", bg: "art/bg_office.jpg",
      exits: ["her_warehouse"]
    },
    gym_out: {
      name: "Gym front", pin: "Gym", bg: "art/bg_gym_out.jpg",
      exits: ["hub", "gym_hall"],
      closed: "It's closed. A bit late to go to the gym."
    },
    gym_hall: {
      name: "Gym corridor", pin: "Gym", bg: "art/bg_gym_hall.jpg",
      exits: ["gym_out", "gym_men", "gym_locker"]
    },
    gym_men: {
      name: "Men's locker room", pin: "Gym", bg: "art/bg_locker.jpg",
      exits: ["gym_hall"]
    },
    gym_locker: {
      name: "Women's locker room", pin: "Gym", bg: "art/bg_locker.jpg",
      exits: ["gym_hall"]
    },
    work_out: {
      name: "HAULR lot", pin: "Your work", bg: "art/bg_work_out.jpg",
      exits: ["hub", "work"],
      closed: "Work's done for the day. Time to head home."
    },
    work: {
      name: "Your office", pin: "Your work", bg: "art/bg_work.jpg",
      exits: ["work_out"], work: true
    },
    library_out: {
      name: "Library steps", pin: "Library", bg: "art/bg_library_out.jpg",
      exits: ["hub", "library"],
      closed: "It's closed. A bit late to go to the library."
    },
    library: {
      name: "Library", pin: "Library", bg: "art/bg_library.jpg",
      exits: ["library_out"], study: true
    },
    sota_out: {
      name: "Neighbor hall", pin: "Sota", bg: "art/bg_sota_hall.jpg",
      exits: ["apt_block", "sota_apt"]
    },
    sota_apt: {
      name: "Sota's apartment", pin: "Sota", bg: "art/bg_sota_apt.jpg",
      exits: ["sota_out"]
    }
  },
  HUB_PINS: [
    { room: "apt_block", label: "Apartment block", x: 22, y: 62, sub: "Your place" },
    { room: "warehouse_out", label: "Her work", x: 72, y: 38, sub: "Warehouse · office · electrical" },
    { room: "gym_out", label: "Gym", x: 48, y: 30, sub: "Corridor \u00B7 lockers" },
    { room: "work_out", label: "Your work", x: 78, y: 70, sub: "Office floor" },
    { room: "library_out", label: "Library", x: 30, y: 32, sub: "Stacks" }
  ],
  RIVALS: [
    { id: "boss", name: "Kurosawa", threat: "Money / job blackmail", open: true },
    { id: "jake", name: "Sota", threat: "Neighbor apartment drift" },
    { id: "carter", name: "Ono", threat: "Industrial + home" },
    { id: "robert", name: "Shinji", threat: "Warehouse / electrical" }
  ]
};
