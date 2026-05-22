const https = require('https');
const fs = require('fs');

// List of popular games with their Steam App IDs from Steam Charts
const games = [
  { id: 730, name: "Counter-Strike 2" }, { id: 578080, name: "PUBG: BATTLEGROUNDS" }, { id: 570, name: "Dota 2" }, { id: 2483190, name: "Forza Horizon 6" }, { id: 1172470, name: "Apex Legends" }, { id: 3419430, name: "Bongo Cat" }, { id: 2868840, name: "Slay the Spire 2" }, { id: 2507950, name: "Delta Force" }, { id: 252490, name: "Rust" }, { id: 431960, name: "Wallpaper Engine" }, { id: 2676230, name: "FiveM" }, { id: 413150, name: "Stardew Valley" }, { id: 1962700, name: "Subnautica 2" }, { id: 480, name: "Spacewar" }, { id: 271590, name: "Grand Theft Auto V Legacy" }, { id: 236390, name: "War Thunder" }, { id: 1973530, name: "Limbus Company" }, { id: 1203220, name: "NARAKA: BLADEPOINT" }, { id: 230410, name: "Warframe" }, { id: 3240220, name: "Grand Theft Auto V Enhanced" }, { id: 322170, name: "Geometry Dash" }, { id: 440, name: "Team Fortress 2" }, { id: 552990, name: "World of Warships" }, { id: 2357570, name: "Overwatch" }, { id: 3241660, name: "R.E.P.O." }, { id: 394360, name: "Hearts of Iron IV" }, { id: 2767030, name: "Marvel Rivals" }, { id: 4128580, name: "BidKing" }, { id: 359550, name: "Tom Clancy's Rainbow Six Siege" }, { id: 1808500, name: "ARC Raiders" }, { id: 381210, name: "Dead by Daylight" }, { id: 3405690, name: "EA SPORTS FC™ 26" }, { id: 3472040, name: "NBA 2K26" }, { id: 438100, name: "VRChat" }, { id: 322330, name: "Don't Starve Together" }, { id: 1366800, name: "Crosshair X" }, { id: 289070, name: "Sid Meier's Civilization VI" }, { id: 264710, name: "Subnautica" }, { id: 218620, name: "PAYDAY 2" }, { id: 1174180, name: "Red Dead Redemption 2" }, { id: 227300, name: "Euro Truck Simulator 2" }, { id: 221100, name: "DayZ" }, { id: 240, name: "Counter-Strike: Source" }, { id: 3551340, name: "Football Manager 26" }, { id: 2807960, name: "Battlefield™ 6" }, { id: 1086940, name: "Baldur's Gate 3" }, { id: 3321460, name: "Crimson Desert" }, { id: 1281930, name: "tModLoader" }, { id: 1245620, name: "ELDEN RING" }, { id: 1364780, name: "Street Fighter™ 6" }, { id: 1091500, name: "Cyberpunk 2077" }, { id: 292030, name: "The Witcher 3: Wild Hunt" }, { id: 359320, name: "Euro Truck Simulator 2" }, { id: 1151640, name: "Horizon Zero Dawn" }, { id: 1593500, name: "God of War" }, { id: 275850, name: "No Man's Sky" }, { id: 107410, name: "Arma 3" }, { id: 41070, name: "Serious Sam 3: BFE" }, { id: 632360, name: "Risk of Rain 2" }, { id: 105600, name: "Terraria" }, { id: 294100, name: "RimWorld" }, { id: 252950, name: "Rocket League" }, { id: 489830, name: "The Elder Scrolls V: Skyrim Special Edition" }, { id: 377160, name: "Fallout 4" }, { id: 220200, name: "Kerbal Space Program" }, { id: 236850, name: "Europa Universalis IV" }, { id: 281990, name: "Stellaris" }, { id: 364360, name: "Slime Rancher" }, { id: 200510, name: "XCOM: Enemy Unknown" }, { id: 582010, name: "Monster Hunter: World" }, { id: 546560, name: "Half-Life: Alyx" }, { id: 620, name: "Portal 2" }, { id: 220, name: "Half-Life 2" }, { id: 10500, name: "F.E.A.R." }, { id: 44000, name: "Terraria" }, { id: 204360, name: "Castle Crashers" }, { id: 219740, name: "Don't Starve" }, { id: 233270, name: "Tropico 5" }, { id: 203770, name: "Crusader Kings II" }, { id: 307130, name: "Sheltered" }, { id: 224760, name: "FEZ" }, { id: 250900, name: "The Binding of Isaac: Rebirth" }, { id: 212480, name: "Among Us" }, { id: 250320, name: "The Wolf Among Us" }, { id: 200900, name: "Cave Story+" }, { id: 208650, name: "Batman: Arkham Knight" }, { id: 20920, name: "The Witcher 2: Assassins of Kings" }, { id: 35140, name: "Batman: Arkham Asylum GOTY" }, { id: 200260, name: "Batman: Arkham City GOTY" }, { id: 205100, name: "Dishonored" }, { id: 201810, name: "The Walking Dead" }, { id: 202970, name: "Call of Duty: Black Ops II" }, { id: 204880, name: "Sins of a Solar Empire: Rebellion" }, { id: 20500, name: "Star Wars: Battlefront II (2005)" }, { id: 21090, name: "BioShock" }, { id: 214850, name: "Ultrawings" }, { id: 219150, name: "Hotline Miami" }, { id: 223750, name: "Darksiders II Deathinitive Edition" }, { id: 224260, name: "No More Room in Hell" }, { id: 225540, name: "Just Cause 3" }, { id: 227940, name: "Awesomenauts" }, { id: 231430, name: "Company of Heroes 2" }, { id: 23310, name: "The Last Remnant" }, { id: 233840, name: "Plants vs. Zombies GOTY" }, { id: 234650, name: "Shadow Warrior" }, { id: 236110, name: "Dungeon Defenders" }, { id: 238960, name: "Path of Exile" }, { id: 242760, name: "The Forest" }, { id: 244210, name: "Assetto Corsa" }, { id: 247400, name: "Worms Clan Wars" }, { id: 24980, name: "Mass Effect 2" }, { id: 257510, name: "The Inner World" }, { id: 262060, name: "Dark Souls II" }, { id: 268500, name: "XCOM 2" }, { id: 274190, name: "Broforce" }, { id: 281610, name: "LEGO Marvel Super Heroes" }, { id: 282800, name: "This War of Mine" }, { id: 284160, name: "BeamNG.drive" }, { id: 286690, name: "Metro 2033 Redux" }, { id: 287390, name: "Metro: Last Light Redux" }, { id: 287700, name: "Thief" }, { id: 291650, name: "Pillars of Eternity" }, { id: 296470, name: "Shadowrun: Dragonfall" }, { id: 300600, name: "DoDonPachi Resurrection" }, { id: 301520, name: "Robocraft" }, { id: 304390, name: "Cities: Skylines" }, { id: 305620, name: "The Long Dark" }, { id: 311340, name: "Banished" }, { id: 319630, name: "Life is Strange" }, { id: 323370, name: "Terraria" }, { id: 327030, name: "Worms W.M.D" }, { id: 33230, name: "Assassin's Creed II" }, { id: 334400, name: "Cities: Skylines" }, { id: 34010, name: "Alone in the Dark" }, { id: 346110, name: "ARK: Survival Evolved" }, { id: 349040, name: "NARUTO SHIPPUDEN: Ultimate Ninja STORM 4" }, { id: 354400, name: "Killing Floor 2" }, { id: 356190, name: "Middle-earth: Shadow of War" }, { id: 361420, name: "ASTRONEER" }, { id: 362960, name: "My Time At Portia" }, { id: 367520, name: "Hollow Knight" }, { id: 374320, name: "DARK SOULS™ III" }, { id: 379720, name: "DOOM" }, { id: 391540, name: "Undertale" }, { id: 39210, name: "Assassin's Creed Brotherhood" }, { id: 396750, name: "EVERSPACE" }, { id: 397540, name: "Hidden Folks" }, { id: 400, name: "Portal" }, { id: 407530, name: "ARK: Survival Evolved" }, { id: 410570, name: "RimWorld" }, { id: 414700, name: "GOD EATER RESURRECTION" }, { id: 418370, name: "The Talos Principle" }, { id: 427520, name: "Factorio" }, { id: 444090, name: "Baldur's Gate: Enhanced Edition" }, { id: 450540, name: "Agony" }, { id: 457140, name: "Oxygen Not Included" }, { id: 460950, name: "Among Us" }, { id: 466560, name: "NieR:Automata" }, { id: 474960, name: "For Honor" }, { id: 493520, name: "GTFO" }, { id: 49520, name: "Borderlands 2" }, { id: 504230, name: "Celeste" }, { id: 524210, name: "NieR:Automata" }, { id: 531640, name: "Totally Accurate Battle Simulator" }, { id: 550, name: "Left 4 Dead 2" }
];

function fetchGameDetails(appId) {
  return new Promise((resolve, reject) => {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=US&l=english`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const appData = json[appId]?.data;
          if (appData) {
            resolve({
              id: appData.steam_appid,
              name: appData.name,
              description: appData.short_description,
              image: appData.header_image,
              genres: (appData.genres || []).map(g => g.description),
              developers: appData.developers || [],
              publishers: appData.publishers || [],
              release_date: appData.release_date?.date || null,
              store_url: `https://store.steampowered.com/app/${appData.steam_appid}`
            });
          } else {
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function fetchAllGames() {
  console.log('Fetching game data from Steam API...');
  const results = [];
  
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    console.log(`Fetching ${i + 1}/${games.length}: ${game.name} (${game.id})`);
    
    try {
      const details = await fetchGameDetails(game.id);
      if (details) {
        results.push(details);
        console.log(`  ✓ Success: ${details.name}`);
      } else {
        console.log(`  ✗ No data found`);
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }
  
  return results;
}

fetchAllGames()
  .then(gamesData => {
    console.log(`\nSuccessfully fetched ${gamesData.length} games`);
    fs.writeFileSync('./games/popular-games.json', JSON.stringify(gamesData, null, 2));
    console.log('Data saved to ./games/popular-games.json');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
