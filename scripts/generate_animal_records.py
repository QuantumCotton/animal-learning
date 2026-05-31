#!/usr/bin/env python3
"""Generate data/animal_records.json with 255 trilingual animal records."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "animal_records.json"

REQUIRED_IDS = [
    "cow", "pig", "chicken", "horse", "goat", "sheep", "duck", "turkey", "rooster", "donkey",
    "llama", "alpaca", "rabbit", "goose", "guinea_pig", "hamster", "ferret", "mule", "pony",
    "pot_bellied_pig", "mouse", "rat", "goldfish", "hedgehog", "wild_boar", "opossum",
    "sugar_glider", "vampire_bat", "stoplight_loosejaw", "siphonophore", "sea_sponge", "sea_pig",
    "black_bear", "brown_bear", "white_tailed_deer", "red_fox", "wolf", "raccoon", "squirrel",
    "moose", "elk", "beaver", "porcupine", "skunk", "badger", "chipmunk", "mole", "stoat",
    "ermine", "wolverine", "river_otter", "woodpecker", "hawk", "falcon", "bobcat", "lynx",
    "cacomistle", "genet", "civet", "koala", "wombat", "tasmanian_devil", "aardvark", "barracuda",
    "gorilla", "chimpanzee", "orangutan", "jaguar", "leopard", "sloth", "howler_monkey",
    "capuchin_monkey", "spider_monkey", "lemur", "tapir", "okapi", "chameleon", "green_iguana",
    "boa_constrictor", "python", "poison_dart_frog", "red_eyed_tree_frog", "anteater", "armadillo",
    "kinkajou", "aye_aye", "tarsier", "fruit_bat", "pangolin", "bush_baby", "anaconda", "sea_pen",
    "sea_fan", "sea_angel", "scallop", "sand_dollar", "lion", "elephant", "hyena", "sea_lion",
    "reindeer", "plankton", "ping_pong_tree_sponge", "oyster", "nudibranch", "nautilus",
    "napoleon_wrasse", "mussel", "monophore", "glass_sponge", "deep_sea_cucumber",
    "deep_sea_amphipod", "conch_snail", "cleaner_shrimp", "basket_star", "trumpetfish",
    "tripod_fish", "stonefish", "pufferfish", "octopus", "moray_eel", "flashlight_fish",
    "cuttlefish", "brisingid_starfish", "boxfish", "big_red_jelly", "beaked_whale",
    "abyssal_spiderfish", "fennec_fox", "jerboa", "scorpion", "gecko", "bottlenose_dolphin",
    "orca", "comb_jelly", "deep_sea_jellyfish", "black_swallower", "faceless_cusk",
    "mariana_snailfish", "wolffish", "spookfish", "ghost_shark", "chimaera", "cusk_eel",
    "snipe_eel", "lizardfish", "grenadier_fish", "six_gill_shark", "cookiecutter_shark",
    "colossal_squid", "oarfish", "coffinfish", "barreleye", "lanternfish", "hatchetfish",
    "gulper_eel", "fangtooth", "viperfish", "polar_bear", "arctic_fox", "arctic_hare", "walrus",
    "harp_seal", "harbor_seal", "beluga_whale", "narwhal", "emperor_penguin", "adelie_penguin",
    "rockhopper_penguin", "caribou", "musk_ox", "lemming", "krill_antarctic", "elephant_seal",
    "leopard_seal", "weddell_seal", "bowhead_whale", "sperm_whale", "snow_goose", "ptarmigan",
    "puffin", "clownfish", "angelfish", "jellyfish", "starfish", "seahorse", "sea_turtle",
    "lobster", "hermit_crab", "brain_coral", "sea_anemone", "butterflyfish", "blue_tang",
    "mandarinfish", "moorish_idol", "parrotfish", "triggerfish", "lionfish", "manta_ray",
    "stingray", "reef_shark", "hammerhead_shark", "great_white_shark", "tiger_shark",
    "sea_urchin", "anglerfish", "blobfish", "vampire_squid", "giant_squid", "dumbo_octopus",
    "goblin_shark", "frilled_shark", "dragonfish", "manatee", "flounder", "turtle", "salamander",
    "sea_otter", "eagle", "hummingbird", "cockatiel", "parakeet", "cardinal", "blue_jay",
    "pelican", "seagull", "albatross", "turkey_vulture", "penguin", "snowy_owl", "parrot",
    "macaw", "toucan", "barn_owl", "great_horned_owl", "border_collie", "golden_retriever",
    "arctic_wolf", "coyote", "siamese_cat", "tabby_cat", "bengal_tiger", "moth", "tarantula",
    "firefly", "leafcutter_ant", "barnacle", "horseshoe_crab", "krill", "japanese_spider_crab",
    "acorn_worm", "fiddler_crab", "giant_clam", "giant_tube_worm", "zombie_worm",
]


def t(en, tl, es):
    return {"en": en, "tl": tl, "es": es}


def rec(hl, wt, basic, edu, hab, reg, diet):
    return {
        "heightLength": t(*hl),
        "weight": t(*wt),
        "facts": {"basic": t(*basic), "edu": t(*edu)},
        "habitat": t(*hab),
        "region": t(*reg),
        "diet": t(*diet),
    }


# Import animal data from companion module
from animal_records_data import RECORDS  # noqa: E402
REWRITES_JSON = ROOT / "data" / "fun_fact_rewrites.json"


def main():
    missing = [aid for aid in REQUIRED_IDS if aid not in RECORDS]
    extra = [aid for aid in RECORDS if aid not in REQUIRED_IDS]
    if missing:
        print(f"ERROR: Missing {len(missing)} animals: {missing}", file=sys.stderr)
        sys.exit(1)
    if extra:
        print(f"WARNING: Extra keys not in required list: {extra}", file=sys.stderr)

    ordered = {aid: RECORDS[aid] for aid in REQUIRED_IDS}
    if REWRITES_JSON.exists():
        rewrites = json.loads(REWRITES_JSON.read_text(encoding="utf-8"))
        for aid, block in rewrites.items():
            if aid not in ordered:
                print(f"WARNING: rewrite for unknown id {aid}", file=sys.stderr)
                continue
            ordered[aid]["facts"]["basic"] = t(block["en"], block["tl"], block["es"])
    else:
        print(f"WARNING: missing {REWRITES_JSON}", file=sys.stderr)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(ordered, ensure_ascii=False, indent=2)
    OUT.write_text(text + "\n", encoding="utf-8")
    parsed = json.loads(text)
    assert len(parsed) == 255
    print(f"Wrote {len(parsed)} animals to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
