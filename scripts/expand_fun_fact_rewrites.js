/**
 * Merges batch-2 fun fact rewrites into data/fun_fact_rewrites.json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data", "fun_fact_rewrites.json");

const BATCH2 = {
  manatee: {
    en: "Manatees are gentle giants that munch seagrass for hours and sometimes give friends a slow-motion hug with their flippers.",
    tl: "Ang manatee ay malumanay na higante na ngumunguya ng seagrass nang matagal at minsan yumayakap sa kaibigan gamit ang flippers.",
    es: "Las manatíes son gigantes gentiles que comen pastos marinos por horas y a veces abrazan a sus amigos con aletas lentas.",
  },
  rabbit: {
    en: "Rabbits cool off through their big ears and can boing three feet high—like a furry pogo stick with a cotton tail.",
    tl: "Nagpapalamig ang kuneho sa malalaking tenga at tumatalon hanggang tatlong talampakan—parang furry pogo stick na may cotton tail.",
    es: "Los conejos se enfrían con orejas grandes y pueden saltar tres pies, como un pogo de peluche con cola de algodón.",
  },
  stoplight_loosejaw: {
    en: "Stoplight loosejaws dangle a glowing red chin lure in the dark, like a secret snack sign only deep-sea fish can read.",
    tl: "May pulang ilaw sa baba ang stoplight loosejaw sa dilim, parang lihim na snack sign na para lang sa isda sa malalim.",
    es: "Las quimeras de barbilla cuelgan un señuelo rojo brillante en la oscuridad, como cartel secreto de comida del mar profundo.",
  },
  border_collie: {
    en: "Border collies are brainy herders that use a laser-stare to guide sheep—like furry air-traffic controllers on the farm.",
    tl: "Matalino ang border collie na parang air-traffic controller sa bukid—titig lang, alam na ng tupa kung saan pupunta.",
    es: "Los border collie guían ovejas con una mirada súper enfocada, como controladores aéreos peludos en la granja.",
  },
  elephant: {
    en: "An elephant’s trunk has thousands of muscles, so it can pick up a peanut, spray a shower, or give a gentle high-five.",
    tl: "Libu-libong muscle ang trunk ng elepante—kayang pulutin ang peanut, mag-shower, o mag-high-five nang dahan-dahan.",
    es: "La trompa del elefante tiene miles de músculos: puede tomar un maní, darse una ducha o dar un choque de mano suave.",
  },
  eagle: {
    en: "Eagles spot tiny prey from skyscraper heights, then dive with talons that grip harder than your strongest handshake.",
    tl: "Nakikita ng agila ang maliit na biktima mula sa napakataas, tapos sumisibol gamit ang talon na mas mahigpit kaysa handshake.",
    es: "Las águilas ven presas diminutas desde alturas enormes y se lanzan con garras más fuertes que un apretón de manos.",
  },
  jellyfish: {
    en: "Jellyfish drift without bones or brains, pulsing like living lava lamps that sting if you boop the wrong tentacle.",
    tl: "Lumulutang ang jellyfish na walang buto at utak, parang living lava lamp na masakit kapag maling tentacle ang natamaan.",
    es: "Las medusas flotan sin huesos ni cerebro, pulsando como lámparas vivas que pican si tocas el tentáculo equivocado.",
  },
  penguin: {
    en: "Penguins can’t fly in air, but they rocket through water like torpedoes, steering with stiff wings and happy feet.",
    tl: "Hindi lumilipad ang penguin sa hangin, pero parang torpedo sa tubig—gumagamit ng matigas na pakpak at masayang paa.",
    es: "Los pingüinos no vuelan en el aire, pero disparan en el agua como torpedos con alas rígidas y patas felices.",
  },
  parrot: {
    en: "Parrots copy sounds, crack puzzles, and laugh like feathered comedians who never forget a favorite word.",
    tl: "Kinokopya ng parrot ang tunog, nalulusutan ang puzzle, at tumatawa na parang feathered comedian na hindi nakakalimot ng salita.",
    es: "Los loros imitan sonidos, resuelven acertijos y ríen como comediantes con plumas que recuerdan sus palabras favoritas.",
  },
  ghost_shark: {
    en: "Ghost sharks glide through deep reefs with spooky eyes and plate teeth, looking like ancient fish from a midnight story.",
    tl: "Lumalangoy ang ghost shark sa malalim na reef na may nakakakilabot na mata—parang sinaunang isda sa kuwentong gabi.",
    es: "Los tiburones fantasma nadan en arrecifes profundos con ojos misteriosos, como peces antiguos de un cuento nocturno.",
  },
  zombie_worm: {
    en: "Zombie worms ooze acid to drill into whale bones, then grow roots inside—like tiny gardeners of the deep sea.",
    tl: "Gumagamit ng acid ang zombie worm para butasin ang buto ng balyena, tapos lumalaki ang ugat sa loob—parang maliit na hardinero sa dagat.",
    es: "Los gusanos zombi usan ácido para perforar huesos de ballena y crecen dentro, como jardineros diminutos del mar profundo.",
  },
  krill_antarctic: {
    en: "Antarctic krill swarm in pink clouds so huge that satellites can spot them from space—ocean glitter with legs.",
    tl: "Nagsasama-sama ang Antarctic krill na parang pink cloud na nakikita pa ng satellite—parang kumikinang na glitter ng dagat.",
    es: "El krill antártico forma nubes rosadas tan grandes que los satélites las ven desde el espacio: purpurina del océano.",
  },
  krill: {
    en: "Krill gather in giant pink swarms that feed whales, fish, and penguins—tiny shrimps with a huge job in the food chain.",
    tl: "Nagsasama-sama ang krill na parang pink na kawan na pinapakain ang balyena, isda, at penguin—maliit pero malaking papel sa food chain.",
    es: "El krill forma enjambres rosados que alimentan ballenas, peces y pingüinos: camarones diminutos con un trabajo enorme.",
  },
  butterflyfish: {
    en: "Butterflyfish swim in bright pairs through coral, flashing stripes like underwater butterflies on a date.",
    tl: "Lumalangoy ang butterflyfish na magkapares sa coral, kumikislap ang guhit na parang butterflies na may date sa ilalim ng dagat.",
    es: "Los peces mariposa nadan en parejas brillantes por el coral, como mariposas submarinas en una cita.",
  },
  blue_tang: {
    en: "Blue tangs zip through reefs in electric blue with sunny tail tips, like swimming highlighters with fins.",
    tl: "Tumatakbo ang blue tang sa reef na parang electric blue na highlighter na may pakpak at dilaw na dulo ng buntot.",
    es: "Los peces cirujano azules cruzan el arrecife en azul eléctrico con cola soleada, como marcadores que nadan.",
  },
  bobcat: {
    en: "Bobcats have short bobbed tails and tufted ears, sneaking through forests like mini lynxes on tiptoe.",
    tl: "Maikli ang buntot ng bobcat at may tufted ears—parang mini lynx na tiptoe sa gubat.",
    es: "Los gatos monteses tienen cola corta y orejas con mechones, deslizándose como linces pequeños de puntillas.",
  },
  beaked_whale: {
    en: "Beaked whales can dive deeper than almost any mammal on one breath—like holding your nose for a roller-coaster ride to the abyss.",
    tl: "Kayang sumisid ang beaked whale nang napakalalim sa isang hininga—parang roller-coaster pababa sa kailaliman.",
    es: "Las ballenas picudas bucean más profundo que casi cualquier mamífero en una respiración, como una montaña rusa al abismo.",
  },
  lanternfish: {
    en: "Lanternfish sparkle with belly lights in the deep sea, and there are so many they might be the most common fish on Earth.",
    tl: "Kumikislap ang lanternfish sa tiyan sa malalim na dagat—posibleng pinakamaraming uri ng isda sa Earth.",
    es: "Los peces linterna brillan en el vientre en el mar profundo y quizá sean los peces más comunes del planeta.",
  },
  lobster: {
    en: "Lobsters taste with their legs and can live longer than a century—clawed grandmas of the seafloor.",
    tl: "Namamalasahan ng lobster gamit ang binti at maaaring umabot ng isang siglo—parang lola na may pangil sa ilalim ng dagat.",
    es: "Las langostas prueban con las patas y pueden vivir más de un siglo: abuelas con pinzas del fondo marino.",
  },
  moray_eel: {
    en: "Moray eels open and close their mouths to breathe—it looks scary, but it’s just underwater gulping, not a mean face.",
    tl: "Binubuksan at isinasara ng moray eel ang bibig para huminga—mukhang nakakatakot pero gulping lang sa tubig.",
    es: "Las morenas abren y cierran la boca para respirar: parece furia, pero solo tragan agua, no es mala cara.",
  },
  moth: {
    en: "Some moths wear disguise wings that copy wasps or owl eyes, throwing a costume party to trick hungry hunters.",
    tl: "May moth na naka-costume na pakpak na parang wasp o mata ng kuwago—parang party ng disguise para lokohin ang hunter.",
    es: "Algunas polillas tienen alas disfrazadas de avispa u ojos de búho, como fiesta de disfraces para engañar depredadores.",
  },
  mouse: {
    en: "Mice whiskers feel the world like radar, helping them zip through dark walls without bumping into trouble.",
    tl: "Parang radar ang whiskers ng daga para dumaan sa madilim na pader nang hindi nabubunggo sa problema.",
    es: "Los bigotes del ratón sienten el mundo como radar y lo ayudan a pasar por paredes oscuras sin chocar.",
  },
  sea_fan: {
    en: "Sea fans wave in the current like lace curtains, catching tiny snacks while doing an underwater ballet.",
    tl: "Umuuga ang sea fan sa agos na parang lace curtain, sumasalo ng maliit na pagkain habang nagsasayaw sa ilalim ng dagat.",
    es: "Los abanicos marinos se mecen como cortinas de encaje y atrapan bocaditos mientras bailan bajo el agua.",
  },
  sea_pen: {
    en: "Sea pens stand on the seafloor like old feather quills, swaying together when the current says ‘dance.’",
    tl: "Nakatayo ang sea pen sa ilalim ng dagat na parang lumang feather quill, sabay umuuga kapag sinabing sumayaw ng agos.",
    es: "Las plumas de mar se plantan en el fondo como plumas antiguas y se mecen cuando la corriente pide bailar.",
  },
  triggerfish: {
    en: "Triggerfish lock their dorsal spine like a safety switch, then bulldoze through reefs with feisty attitudes.",
    tl: "Naka-lock ang dorsal spine ng triggerfish na parang safety switch, tapos rumaragasa sa reef na may feisty attitude.",
    es: "Los peces ballesta bloquean su espina dorsal como interruptor y avanzan por el arrecife con actitud valiente.",
  },
  tripod_fish: {
    en: "Tripod fish perch on long fin stilts on the muddy seafloor, standing still like underwater camera tripods waiting for dinner.",
    tl: "Nakapatong ang tripod fish sa mahabang fin stilts sa putik, nakatayo na parang camera tripod na naghihintay ng hapunan.",
    es: "Los peces trípode se apoyan en aletas largas como trípodes de cámara en el fondo fangoso esperando la cena.",
  },
  trumpetfish: {
    en: "Trumpetfish float nose-down and drift like skinny shadows, sneaking up on fish that never see the surprise coming.",
    tl: "Lumulutang ang trumpetfish na ulo pababa, parang payat na anino na palapit nang palapit bago ang sorpresa.",
    es: "Los peces trompeta flotan cabeza abajo como sombras delgadas y se acercan sin que el pez lo note.",
  },
  turkey_vulture: {
    en: "Turkey vultures sniff out meals from miles away, doing nature’s cleanup job with wings built for soaring all day.",
    tl: "Naaamoy ng turkey vulture ang pagkain mula sa malayo—nature cleanup crew na lumilipad buong araw.",
    es: "Los zopilotes huelen comida desde lejos y limpian la naturaleza con alas hechas para planear todo el día.",
  },
  ptarmigan: {
    en: "Ptarmigan swap to snow-white feathers in winter and grow extra feathery snowshoes on their feet for fluffy tundra walks.",
    tl: "Nagiging puti ang ptarmigan sa taglamig at lumalaki ang feather sa paa na parang snowshoes sa tundra.",
    es: "El lagópodo se vuelve blanco en invierno y crece plumas en los pies como raquetas para caminar en la tundra.",
  },
  leopard_seal: {
    en: "Leopard seals have spotted coats and grinning faces, ruling icy waters as top hunters with a splash of drama.",
    tl: "May batik na balahibo ang leopard seal at nakangiting mukha—top hunter sa yelo na may kaunting drama.",
    es: "Las focas leopardo tienen manchas y sonrisa amplia, reinando en aguas heladas como cazadoras con drama.",
  },
  mariana_snailfish: {
    en: "Mariana snailfish live deeper than any other fish—almost 27,000 feet down, where the pressure could squish a truck.",
    tl: "Nakatira ang Mariana snailfish nang mas malalim pa sa ibang isda—halos 27,000 feet, kayang pisakin ang truck ng pressure.",
    es: "El pez caracol de las Marianas vive más profundo que cualquier pez, donde la presión aplastaría un camión.",
  },
  snipe_eel: {
    en: "Snipe eels have beak-like jaws on tiny heads, curving out like deep-sea needles sewing through the dark.",
    tl: "May beak-like jaws ang snipe eel sa maliit na ulo—parang karayom na naghahabi sa dilim ng dagat.",
    es: "Las anguilas picuda tienen mandíbulas en cabezas diminutas, como agujas que cosen la oscuridad del mar profundo.",
  },
  flounder: {
    en: "Flounders begin life with eyes on both sides, then one eye slides over for the ultimate fish makeover.",
    tl: "Nagsisimula ang flounder na may mata sa magkabilang side, tapos lumilipat ang isa—ultimate fish makeover.",
    es: "Los platijas empiezan con ojos a los dos lados y luego uno se mueve: el cambio de imagen definitivo.",
  },
  sand_dollar: {
    en: "Sand dollars are flat urchins with tiny hairs that move them slowly, like living coins crawling across the seafloor.",
    tl: "Flat urchin ang sand dollar na may maliit na buhok na gumagalaw dahan-dahan—parang barya na gumagapang sa dagat.",
    es: "Los dólares de arena son erizos planos con pelitos que los mueven lentamente, como monedas vivas en el fondo.",
  },
  tiger_shark: {
    en: "Tiger sharks wear stripe patterns when young and will try almost any snack—including things that definitely aren’t fish food.",
    tl: "May guhit ang tiger shark noong bata at susubukan halos lahat ng pagkain—kahit hindi talaga pagkain ng isda.",
    es: "Los tiburones tigre tienen rayas de jóvenes y prueban casi cualquier bocado, incluso cosas que no son comida.",
  },
  stingray: {
    en: "Stingrays hide under sand with only eyes peeking out, like shy pancakes waiting to whoosh away.",
    tl: "Nagtatago ang stingray sa buhangin na mata lang ang kita—parang mahiyain na pancake na biglang aalis.",
    es: "Las rayas se entierran en arena con solo los ojos afuera, como panqueques tímidos listos para deslizarse.",
  },
  six_gill_shark: {
    en: "Six-gill sharks are ancient deep swimmers with an extra gill slit, like sharks wearing a bonus breathing pocket.",
    tl: "Sinauna ang six-gill shark sa malalim at may extra gill slit—parang shark na may bonus breathing pocket.",
    es: "Los tiburones de seis branquias son nadadores antiguos con una hendidura extra, como un bolsillo de respiración.",
  },
  siphonophore: {
    en: "A siphonophore looks like one animal but is a team of tiny clones linked together—an underwater buddy chain.",
    tl: "Mukhang isang hayop ang siphonophore pero team ng maliliit na clone—parang buddy chain sa ilalim ng dagat.",
    es: "La sifonófora parece un solo animal, pero es un equipo de clones unidos: una cadena de amigos submarinos.",
  },
  acorn_worm: {
    en: "Acorn worms look like slim acorns that spit sticky mucus nets to catch food—gross, but brilliant for a worm.",
    tl: "Mukhang acorn ang acorn worm na naglalabas ng malagkit na mucus net para huli ng pagkain—kadiri pero talino.",
    es: "Los gusanos bellota parecen bellotas delgadas que lanzan redes de moco para atrapar comida: asqueroso pero genial.",
  },
  barnacle: {
    en: "Barnacles glue their heads to rocks and kick food into their mouths with feathery legs—upside-down filter fans.",
    tl: "Idinidikit ng barnacle ang ulo sa bato at sinisipa ang pagkain papasok sa bibig gamit ang feather legs.",
    es: "Los percebes pegan la cabeza a las rocas y meten comida con patas plumosas, como ventiladores al revés.",
  },
  angelfish: {
    en: "Angelfish glide through coral like flat golden frisbees, turning corners with fins that sparkle in sunbeams.",
    tl: "Dumadaan ang angelfish sa coral na parang flat golden frisbee, kumukutkot sa sulok na kumikislap sa araw.",
    es: "Los peces ángel cruzan el coral como frisbees dorados planos que brillan al girar en los rayos de sol.",
  },
  abyssal_spiderfish: {
    en: "Abyssal spiderfish sprawl on the seafloor with long spiny fins, looking like spiders that traded webs for deep-sea chill.",
    tl: "Nakahawak sa sahig ang abyssal spiderfish na may mahabang tinik na fin—parang gagamba sa malalim na dagat.",
    es: "El pez araña abisal yace en el fondo con aletas espinosas largas, como arañas del mar profundo.",
  },
  boxfish: {
    en: "Boxfish swim in tiny armored boxes with puckered lips, wiggling through reefs like little underwater robots.",
    tl: "Lumalangoy ang boxfish na parang maliit na armored box na may puckered lips—parang underwater robot.",
    es: "Los peces cofre nadan en cajas acorazadas con labios fruncidos, como robots diminutos del arrecife.",
  },
  brain_coral: {
    en: "Brain corals grow wrinkly mounds that look like giant thinking caps, building reef cities one bump at a time.",
    tl: "Lumalaki ang brain coral na parang giant thinking cap, nagtatayo ng reef city isang bump kada beses.",
    es: "Los corales cerebro forman montículos arrugados como gorras gigantes, construyendo ciudades de arrecife.",
  },
  cleaner_shrimp: {
    en: "Cleaner shrimp run fish spas, picking off itchy parasites while customers hold still for a free tickle clean.",
    tl: "Nagpapatakbo ang cleaner shrimp ng fish spa—tinatanggal ang parasite habang naka-stay ang customer para libreng linis.",
    es: "Los camarones limpiadores abren spas para peces y quitan parásitos mientras el cliente se queda quieto.",
  },
  coyote: {
    en: "Coyotes yip and howl from forests to city parks, proving you can be wild, clever, and still find dinner anywhere.",
    tl: "Umuungal ang coyote mula gubat hanggang park—wild, talino, at laging may mahanap na hapunan.",
    es: "Los coyotes aúllan del bosque al parque, salvajes y listos, encontrando cena en cualquier lugar.",
  },
  goldfish: {
    en: "Goldfish remember feeding tricks for months, busting the myth that they forget everything in three seconds flat.",
    tl: "Natatandaan ng goldfish ang tricks sa pagkain nang buwan-buwan—hindi totoo ang three-second memory myth.",
    es: "Los peces dorados recuerdan trucos por meses, rompiendo el mito de que olvidan en tres segundos.",
  },
  glass_sponge: {
    en: "Glass sponges build lacy skeletons from silica that look like spun-glass sculptures—fancy houses for deep water.",
    tl: "Gumagawa ang glass sponge ng lace skeleton na parang spun-glass sculpture—fancy house sa malalim.",
    es: "Las esponjas de vidrio forman esqueletos de encaje como esculturas de cristal: casas elegantes en aguas profundas.",
  },
  giant_squid: {
    en: "Giant squids battle sperm whales in the deep, turning the dark ocean into a real-life legend book.",
    tl: "Nakikipaglaban ang giant squid sa sperm whale sa malalim—parang legend book na totoo sa dagat.",
    es: "Los calamares gigantes luchan con cachalotes en la oscuridad, como leyendas reales del mar profundo.",
  },
  hatchetfish: {
    en: "Hatchetfish are shaped like silver hatchets with glowing bellies, flashing lights to chat in the midnight sea.",
    tl: "Hugis silver hatchet ang hatchetfish na may kumikislap na tiyan—nagpapailaw para mag-usap sa dagat.",
    es: "Los peces hacha parecen hachas plateadas con vientres brillantes que parpadean para hablar en el mar nocturno.",
  },
  japanese_spider_crab: {
    en: "Japanese spider crabs stretch legs wider than a car, earning the title of world’s widest crustacean superstar.",
    tl: "Mas malapad pa sa kotse ang legs ng Japanese spider crab—pinakamalawak na crustacean superstar.",
    es: "El cangrejo araña japonés abre patas más anchas que un auto: el crustáceo más ancho del mundo.",
  },
  sea_urchin: {
    en: "Sea urchins are spiky pincushions that graze algae with a five-tooth mouth hidden under all those needles.",
    tl: "Spiky pincushion ang sea urchin na kumakain ng algae gamit ang five-tooth mouth sa ilalim ng tinik.",
    es: "Los erizos de mar son almohadillas con púas que comen algas con una boca de cinco dientes escondida.",
  },
  sea_pig: {
    en: "Sea pigs waddle on tube feet across the abyss, looking like pink potatoes that grew legs and joined a marching band.",
    tl: "Kumakawng sea pig gamit ang tube feet sa abyss—parang pink potato na may paa at sumasabay sa banda.",
    es: "Los cerdos de mar caminan con patas tubulares en el abismo, como papas rosadas con piernas en una banda.",
  },
  orca: {
    en: "Orcas wear black-and-white tuxedo coats and hunt in tight family pods, chatting with clicks that sound like underwater Morse code.",
    tl: "Itim-puti ang orca na parang tuxedo, mangangaso kasama ang pamilya, nag-uusap sa clicks na parang Morse code sa tubig.",
    es: "Las orcas lucen esmoquin blanco y negro, cazan en familia y hablan con clics como código Morse submarino.",
  },
  big_red_jelly: {
    en: "Big red jellies drift like giant crimson umbrellas in the deep, pulsing slow and spooky through the dark.",
    tl: "Lumulutang ang big red jelly na parang malaking crimson umbrella sa dilim, mabagal at nakakakilabot.",
    es: "Las medusas rojas grandes flotan como paraguas carmesí en la profundidad, pulsando lento y misterioso.",
  },
  basket_star: {
    en: "Basket stars open branching arms like living lace nets, catching plankton snacks from passing currents.",
    tl: "Binubuksan ng basket star ang braso na parang lace net, sumasalo ng plankton mula sa agos.",
    es: "Las estrellas canasta abren brazos como redes de encaje vivas y atrapan plancton de la corriente.",
  },
  barreleye: {
    en: "Barreleye fish have see-through heads so you can peek at their green tube eyes—like a fish with a glass helmet.",
    tl: "See-through ang ulo ng barreleye kaya kitang-kita ang green tube eyes—parang isda na may glass helmet.",
    es: "El pez cabeza transparente tiene cráneo claro y ojos verdes en tubo, como casco de vidrio.",
  },
  fangtooth: {
    en: "Fangtooth fish pack the biggest teeth for their size in the ocean—a grin that could win a scary contest.",
    tl: "Pinakamalaking ngipin sa itsura ang fangtooth—ngiting panalo sa scary contest sa dagat.",
    es: "El pez colmillo tiene los dientes más grandes para su tamaño: una sonrisa campeona de miedo.",
  },
  viperfish: {
    en: "Viperfish flash needle fangs so long they barely fit, lighting up the dark to scare snacks into surprise.",
    tl: "May needle fangs ang viperfish na halos hindi kasya—nagpapailaw sa dilim para magulat ang biktima.",
    es: "El pez víbora muestra colmillos larguísimos y brilla en la oscuridad para asustar a su comida.",
  },
  wolffish: {
    en: "Wolffish look fierce with chunky teeth, but they gently crunch sea urchins like crackers to help the reef.",
    tl: "Mukhang fierce ang wolffish pero dahan-dahang ngangata ng sea urchin na parang cracker para tulungan ang reef.",
    es: "El pez lobo parece feroz, pero mastica erizos de mar como galletas para ayudar al arrecife.",
  },
  sea_turtle: {
    en: "Sea turtles navigate for decades and return to the same beach where they hatched—GPS hearts with flippers.",
    tl: "Naglalakbay ang sea turtle nang dekada at bumabalik sa parehong beach kung saan ipinanganak—parang GPS na may flippers.",
    es: "Las tortugas marinas viajan décadas y vuelven a la playa donde nacieron: corazones GPS con aletas.",
  },
  tabby_cat: {
    en: "Tabby cats often sport an M-shaped mark on their forehead, like a tiny tiger crown saying ‘king of the couch.’",
    tl: "Kadalasang may M-shaped mark sa noo ang tabby cat—parang tiny tiger crown na hari ng couch.",
    es: "Los gatos atigrados suelen tener una M en la frente, como corona de tigre mini en el sofá.",
  },
  llama: {
    en: "Llamas hum when they’re happy, a soft song that sounds like a fuzzy friend saying ‘life is good today.’",
    tl: "Umuungal ang llama kapag masaya—malambot na kanta na parang sinasabing maganda ang araw.",
    es: "Las llamas tararean cuando están felices, como un amigo peludo que dice ‘hoy la vida está bien.’",
  },
  weddell_seal: {
    en: "Weddell seals sing underwater songs that bounce through Antarctic ice, like chilly karaoke stars.",
    tl: "Kumakanta ang Weddell seal sa ilalim ng tubig at umaalingawngaw sa yelo—parang karaoke star sa Antartiko.",
    es: "Las focas Weddell cantan bajo el hielo antártico, como estrellas de karaoke heladas.",
  },
  aardvark: {
    en: "Aardvarks slurp ants with a sticky tongue longer than a ruler, turning anthills into all-you-can-eat buffets.",
    tl: "Sinisipsip ng aardvark ang langgam gamit ang malagkit na dila na mas mahaba pa sa ruler—buffet ng anthill.",
    es: "Los osos hormigueros lamen hormigas con lengua pegajosa más larga que una regla: buffet de hormiguero.",
  },
};

const current = JSON.parse(fs.readFileSync(FILE, "utf8"));
const merged = { ...current, ...BATCH2 };
fs.writeFileSync(FILE, JSON.stringify(merged, null, 2) + "\n");
console.log(`Merged ${Object.keys(BATCH2).length} entries; total ${Object.keys(merged).length}`);
