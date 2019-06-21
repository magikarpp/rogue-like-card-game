let isStart = false;
let isBattle = false;
let isActive = false;
let isTutorial = false;
let isInventory = false;
let battleStep = 0;
let paused = false;
let shopKeeperLock = false;
let shopKeeperItems = {};

let current_floor = 1;
let counter = 0;
let inv_step = 0;
let gen_step = 0;
let options = 0;
let lock = 0;

let player;
let p_name = "";
let deck = [];
let tempDeck = [];
let current_cards = [];
let inventory = {};
let temp_inv = {};
let active_card;
let enemies = [];
let dead_enemies = [];

let bossFight = false;
let allEnemies = {};
let allEnemiesCategory = {};
let allCards = {};
let allCardsCategory = {};
let allItems = {};
let allItemsCategory = {};
let allStatus = {};
let allStatusCategory = {};

let isTesting = false;

initialize();


function initialize(){
  document.addEventListener("keyup", buttonPress);

  document.getElementById("characters").style.display = "none";
  document.getElementById("cards").style.display = "none";
  document.getElementById("info").style.visibility = "hidden";
  document.getElementById("deck-list").style.display = "none";
  document.getElementById("inventory-list").style.display = "none";

  document.getElementById("deck-list").onclick = function(){
    updateDeckModal();
    paused = true;
    lock = 0;
    if(!isActive){
      lock = 1;
      isActive = true;
    }
    document.getElementById("deck-modal").style.display = "block";
  }
  document.getElementById("deck-close").onclick = function(){
    paused = false;
    if(lock == 1) isActive = false;
    document.getElementById("deck-modal").style.display = "none";
  }
  window.onclick = function(event){
    if(event.target == document.getElementById("deck-modal")){
      paused = false;
      if(lock == 1) isActive = false;
      document.getElementById("deck-modal").style.display = "none";
    }
  }

  document.getElementById("inventory-list").onclick = function(){
    document.getElementById("item-used").innerHTML = "";
    inv_step = 0;
    updateInventoryModal();
    paused = true;
    isInventory = true;
    lock = 0;
    if(!isActive){
      lock = 1;
      isActive = true;
    }
    document.getElementById("inventory-modal").style.display = "block";
  }
  document.getElementById("inventory-close").onclick = function(){
    inv_step = -1;
    paused = false;
    isInventory = false;
    if(lock == 1) isActive = false;
    document.getElementById("inventory-modal").style.display = "none";
  }
  window.onclick = function(event){
    if(event.target == document.getElementById("inventory-modal")){
      paused = false;
      isInventory = false;
      inv_step = -1;
      if(lock == 1) isActive = false;
      document.getElementById("inventory-modal").style.display = "none";
    }
  }

  initCards();
  initEnemies();
  initItems();
  initStatus();

  if(isTesting) testingFunction();
  else start();
}

function testingFunction(){
  document.getElementById("info").style.visibility = "visible";
  document.getElementById("deck-list").style.display = "inline-block";
  document.getElementById("inventory-list").style.display = "inline-block";

  p_name = "Tester";

  document.getElementById("info-name").innerHTML = p_name;
  player = new Character("warrior");

  isStart = true;

  initDeck();
  for(let i = 0; i < 3; i++){
    pushCard(allCardsCategory["Job"](player.job).name, player);
  }

  addItemToInventory(allItemsCategory["Level"](player.level));
  addItemToInventory(allItemsCategory["Level"](player.level));
  addItemToInventory(allItemsCategory["Level"](player.level));
  addItemToInventory(allItemsCategory["Level"](player.level));
  addItemToInventory(allItemsCategory["Level"](player.level));
  addItemToInventory(allItemsCategory["Level"](player.level));
  addItemToInventory(allItemsCategory["Level"](player.level));

  checkStats();

  startFloor(current_floor);
}

function buttonPress(event){
  //TODO: implement clicks.
  if(isStart){
    if(event.key == "i"){
      if(paused){
        inv_step = -1;
        paused = false;
        isInventory = false;
        if(lock == 1) isActive = false;
        document.getElementById("inventory-modal").style.display = "none";
      } else{
        document.getElementById("item-used").innerHTML = "";
        inv_step = 0;
        updateInventoryModal();
        paused = true;
        isInventory = true;
        lock = 0;
        if(!isActive){
          lock = 1;
          isActive = true;
        }
        document.getElementById("inventory-modal").style.display = "block";
      }
    } else if(event.key == "d"){
      if(paused){
        paused = false;
        if(lock == 1) isActive = false;
        document.getElementById("deck-modal").style.display = "none";
      } else{
        updateDeckModal();
        paused = true;
        lock = 0;
        if(!isActive){
          lock = 1;
          isActive = true;
        }
        document.getElementById("deck-modal").style.display = "block";
      }
    }
  }

  if(isActive){
    if(paused){
      if(isInventory){
        if(event.key > 0 && event.key < options + 1){
          inv_step = event.key;
        }
      }
    }
    else if(isBattle){
      if(battleStep == 0){
        let size = current_cards.length;
        if(event.key > 0 && event.key < size + 1){
          active_card = event.key - 1;
          document.getElementById("c" + (event.key - 1)).style.border = "1px solid purple";
          activateCard(event.key - 1);
        }
      }
      else if(battleStep == 1){
        let size = enemies.length;
        if(event.key > 0 && event.key < size + 1){
          activateCard(active_card, event.key - 1);
          battleStep = 0;
        }
      }
    }
    else if(!isBattle){
      if(event.key > 0 && event.key < options + 1){
        gen_step = event.key;
      }
    }
  }
}

function updateInventoryModal(){
  options = Object.keys(inventory).length;

  let deckNode = document.getElementById("inventory-listing");
  while (deckNode.firstChild) {
      deckNode.removeChild(deckNode.firstChild);
  }

  let position = 1;
  temp_inv = {};

  document.getElementById("player-gold").innerHTML = player.gold + " gold";

  for(let key in inventory){
    let value = inventory[key];
    let newNode = document.createElement("p");
    newNode.innerHTML = "<span style='color: purple;'>(" + position + ")</span> " + "x" + value + " " + key;
    deckNode.appendChild(newNode);
    temp_inv[position] = key;
    position++;
  }

  if(inv_step != -1){
    invLoop();
  }

  function invLoop(){
    if(inv_step == -1){
      inv_step = 0;
      temp_inv = {};
      return;
    } else if(inv_step != 0){
      useItem(inv_step);
    } else{
      //Don't pause: already game paused.
      setTimeout(invLoop, 0);
    }
  }
}

function updateDeckModal(){
  let deckNode = document.getElementById("deck-listing");
  while (deckNode.firstChild) {
      deckNode.removeChild(deckNode.firstChild);
  }

  let dict = {};
  for(let i = deck.length - 1; i >= 0; i--){
    if(dict[deck[i].name] == undefined || dict[deck[i].name] == null){
      dict[deck[i].name] = 1;
    } else{
      dict[deck[i].name]++;
    }
  }

  let total = 0;

  for(let key in dict){
    let value = dict[key];
    total += value;
    let newNode = document.createElement("p");
    newNode.innerHTML = "x" + value + " " + key;
    deckNode.appendChild(newNode);
  }

  let newNode = document.createElement("hr");
  newNode.style.marginRight = "75%";
  deckNode.appendChild(newNode);

  newNode = document.createElement("p");
  newNode.innerHTML = "Total Cards: " + total;
  deckNode.appendChild(newNode);
}


function addItemToInventory(item){
  inventory[item.name] = (inventory[item.name] || 0) + 1;
}

function useItem(num){
  inv_step = 0;
  allItems[temp_inv[num]]().effect();
  checkStats();
  document.getElementById("item-used").innerHTML = "You used " + temp_inv[num] + ".";
  inventory[temp_inv[num]] = inventory[temp_inv[num]] - 1;
  if(inventory[temp_inv[num]] == 0){
    delete inventory[temp_inv[num]];
  }

  updateInventoryModal();

}


function initEnemies(){
  allEnemiesCategory["Level"] = levelTheme;
  allEnemiesCategory["Race"] = Race;
  allEnemiesCategory["Count"] = Count;

  allEnemies["Goblin Soldier"] = GoblinSoldier;
  allEnemies["Small Goblin"] = SmallGoblin;
  allEnemies["Large Goblin"] = LargeGoblin;
  allEnemies["Goblin Shaman"] = GoblinShaman;
  allEnemies["Goblin Warchief"] = GoblinWarchief;
  allEnemies["Goblin Wolfrider"] = GoblinWolfrider;

  allEnemies["Small Zombie"] = SmallZombie;
  allEnemies["Large Zombie"] = LargeZombie;
  allEnemies["Abomination"] = Abomination;
  allEnemies["Necromancer"] = Necromancer;
  allEnemies["Zombie Dragon"] = ZombieDragon;

  function GoblinSoldier(){
    let dude = new Enemy(1, 18, randomNum(125, 5), 3, "Goblin Soldier", "Goblin", "normal", randomNum(25, 5), randomNum(2, 1), 0, 2, 0, [], ["A Goblin Solider catches you in it's gaze.", "You spot a Goblin Solider in the distance."], [], ["Goblin Soldier falls to the ground."]);
    pushCard("Heavy Attack", dude);
    pushCard("Attack", dude);
    pushCard("Attack", dude);
    return dude;
  }
  function SmallGoblin(){
    let dude = new Enemy(1, 10, randomNum(75, 5), 95, "Small Goblin", "Goblin", "normal", randomNum(15, 5), randomNum(2, 1), 0, 0, 0, [], ["You see a small pair of red eyes lurking forward.", "A Small Goblin dashes towards you.", "A Small Goblin stands in your way."], [], ["Small Goblin collapses."]);
    pushCard("Attack", dude);
    return dude;
  }
  function LargeGoblin(){
    let dude = new Enemy(1, 18, randomNum(125, 5), 3, "Large Goblin", "Goblin", "normal", randomNum(30, 5), randomNum(2, 1), 0, 0, 0, [], ["You see a large pair of red eyes lurking forward.", "A Large Goblin dashes towards you.", "A Large Goblin stands in your way."], [], ["Large Goblin can no longer move."]);
    pushCard("Heavy Attack", dude);
    pushCard("Attack", dude);
    return dude;
  }
  function GoblinShaman(){
    let dude = new Enemy(1, 20, randomNum(155, 5), 2, "Goblin Shaman", "Goblin", "normal", randomNum(22, 2), 1, 1, 0, 3, [], ["A Goblin Shaman teleports in front you.", "A Goblin Shaman appears before you."], [], ["Goblin Shaman vanishes."]);
    pushCard("Attack", dude);
    pushCard("Sm. Bandaid", dude);
    pushCard("Minor Def. Buff", dude);
    pushCard("Minor Atk. Buff", dude);
    pushCard("Small Energy Ball", dude);
    return dude;
  }
  function GoblinWolfrider(){
    let dude = new Enemy(1, 20, randomNum(155, 5), 2, "Goblin Wolfrider", "Goblin", "normal", randomNum(34, 3), randomNum(3, 1), 0, 1, 0, [], ["You spot a goblin riding a wolf.", "A Goblin Wolfrider appears before you."], [], ["Goblin Wolfrider rides away."]);
    pushCard("Attack", dude);
    pushCard("Bite", dude);
    pushCard("Bite", dude);
    pushCard("Bite", dude);
    pushCard("Roar", dude);
    return dude;
  }
  function GoblinWarchief(){
    let dude = new Enemy(1, 60, randomNum(1000, 50), 100, "Goblin Warchief", "Goblin-Boss", "normal", randomNum(60, 5), randomNum(8, 1), 0, 3, 0, [], ["Goblin Warchief screeches out at your sight.", "You spot a Goblin Warchief eating a small goblin.", "The tattoos on the Goblin Warchief kinda look cool."], [], ["Goblin Warchief falls to the ground."]);
    pushCard("Heavy Attack", dude);
    pushCard("Heavy Attack", dude);
    pushCard("Heavy Attack", dude);
    pushCard("Roar", dude);
    pushCard("Attack", dude);
    return dude;
  }

  function SmallZombie(){
    let dude = new Enemy(1, 14, randomNum(105, 5), 80, "Small Zombie", "Undead Zombie", "normal", randomNum(24, 3), 1, 0, -1, 0, [], ["You smell a rotten stench approach you.", "A Small Zombie stands in your way."], [], ["Small Zombie collapses."]);
    pushCard("Attack", dude);
    pushCard("Attack", dude);
    pushCard("Bite", dude);
    return dude;
  }
  function LargeZombie(){
    let dude = new Enemy(1, 20, randomNum(145, 5), 15, "Large Zombie", "Undead Zombie", "normal", randomNum(32, 3), randomNum(2, 1), 0, 0, 0, [], ["You smell a rotten stench approach you.", "A Large Zombie stands in your way.", "You stumble across a Large Zombie."], [], ["Large Zombie collapses."]);
    pushCard("Attack", dude);
    pushCard("Heavy Attack", dude);
    pushCard("Bite", dude);
    return dude;
  }
  function Abomination(){
    let dude = new Enemy(1, 25, randomNum(155, 5), 10, "Abomination", "Undead Zombie", "normal", randomNum(40, 5), randomNum(2, 1), 0, 3, 0, [], ["An abomination of an Abomination glares your way.", "What in Abomination?", "An indescribably hideous zombie stands in your way."], [], ["Abomination disinigrates"]);
    pushCard("Attack", dude);
    return dude;
  }
  function Necromancer(){
    let dude = new Enemy(1, 28, randomNum(175, 5), 10, "Necromancer", "Zombie", "normal", randomNum(22, 2), 1, randomNum(3, 1), 0, 3, [], ["A Necromancer flaunts its staff at you.", "You hear a Necromancer's chant nearby.", "Necromancer summons zombies."], [], ["Necromancer collapses."]);
    pushCard("Small Energy Ball", dude);
    pushCard("Sm. Bandaid", dude);
    pushCard("Minor Def. Curse", dude);
    pushCard("Minor Atk. Curse", dude);

    return dude;
  }
  function ZombieDragon(){
    let dude = new Enemy(1, 70, randomNum(1020, 50), 100, "Zombie Dragon", "Undead Dragon Zombie-Boss", "normal", randomNum(60, 5), randomNum(4, 1), randomNum(4, 1), 2, 4, [], ["Zombie Dragon roars at your appearance.", "Zombie Dragon glares towards you.", "You spot a rotting Zombie Dragon."], [], ["Zombie Dragon falls to its demise."]);
    pushCard("Bite", dude);
    pushCard("Bite", dude);
    pushCard("Bite", dude);
    pushCard("Rest", dude);
    pushCard("Roar", dude);
    pushCard("Poison Breath", dude);
    return dude;
  }

  function Race(race, boss){
    let array = [];
    for(let key in allEnemies){
      let value = allEnemies[key]();
      if(boss){ if(value.race) if(value.race.includes(race + "-Boss")) array.push(value); }
      else{ if(value.race) if(!value.race.includes("-Boss")) if(value.race.includes(race)) array.push(value); }
    }

    let found = false;
    let dude;

     while(!found){
       dude = array[Math.floor(Math.random() * array.length)];
       if(boss) found = true;
       else{
        if(dude.chance > Math.floor(Math.random() * 100)) found = true;
       }
     }

     return dude;
  }
  function Count(race){
    if(race == "Goblin") return 3;
    else if(race == "Zombie") return 2;
    else return 2;
  }

  function levelTheme(level){
    let array = [];
    for(let key in allEnemies){
      let value = allEnemies[key]();
      if(value.level) if(value.level == level) if(!value.race.includes("-Boss")){
        let races = value.race.split(" ");
        if(!array.includes(races[races.length - 1])) array.push(races[races.length - 1]);
      }
    }

    return array[Math.floor(Math.random() * array.length)];
  }
}

function initCards(){
  //Job: Any
  //Lvl: 1
  allCards["Attack"] = Attack;
  allCards["Attack1"] = Attack;
  allCards["Do Nothing"] = DoNothing;
  allCards["Do Nothing1"] = DoNothing;
  allCards["Do Nothing2"] = DoNothing;
  allCards["Rest"] = Rest;
  allCards["Rest1"] = Rest;
  allCards["Rest2"] = Rest;
  allCards["Rest3"] = Rest;
  allCards["Sm. Bandaid"] = SmallBandaid;
  allCards["Minor Atk. Buff"] = MinorAttackBuff;
  allCards["Minor Def. Buff"] = MinorDefenseBuff;
  allCards["Minor Atk. Curse"] = MinorAttackCurse;
  allCards["Minor Def. Curse"] = MinorDefenseCurse;
  allCards["Small Energy Ball"] = SmallEnergyBall;
  //Lvl:2
  allCards["Poison Breath"] = PoisonBreath;

  allCards["Bite"] = Bite;
  allCards["Roar"] = Roar;

  allCards["Heavy Attack"] = HeavyAttack;
  allCards["Blood Strike"] = BloodStrike;
  allCards["Flame Sword"] = FlameSword;

  allCards["Cycle"] = Cycle;
  allCards["Double Strike"] = DoubleStrike;
  allCards["Theft"] = Theft;

  allCards["Fireball"] = Fireball;
  allCards["Minor Focus"] = MinorFocus;
  allCards["Lightning Strike"] = LightningStrike;

  allCardsCategory["Job"] = Job;

  function Attack(){
    let thing = new Card(1, "Attack", "normal", "Any", true, 5, 0, 0, 0, 0, 20, "A normal attack.", ["(you) takes a swing at (enemy).", "(you) swings at (enemy).", "(you) pokes (enemy).", "(you) smacks (enemy)."]);
    return thing;
  }
  function Throw(){
    let thing = new Card(1, "Throw", "normal", "Any", true, 5, 0, 0, 0, 0, 20, "A weak throw.", ["(you) throws (enemy) across the room.", "(you) sends (enemy) flying."]);
    return thing;
  }
  function DoNothing(){
    let thing = new Card(1, "Do Nothing", "normal", "Any", false, 0, 0, 0, 0, 0, 0, "Do Nothing.", ["(you) does nothing.", "(you) durdles."]);
    return thing;
  }
  function Rest(){
    let thing = new Card(1, "Rest", "normal", "Any", false, 0, 0, 0, 0, 0, 0, "Recover health, stamina, and mana.", ["(you) rests for a second.", "(you) relaxes.", "(enemy) looks confused as (you) sleeps."]);
    thing.effect = function(){
      this.user.currentHealth += 10;
      if(this.user.currentHealth > this.user.totalHealth) this.user.currentHealth = this.user.totalHealth;
      this.user.currentStamina += 25;
      if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
      this.user.currentMana += 25;
      if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
    };
    return thing;
  }
  function SmallBandaid(){
    let thing = new Card(1, "Sm. Bandaid", "normal", "Any", false, 0, 0, 0, 0, 0, 20, "Recover minor health.", ["(you) puts on a bandaid."]);
    thing.effect = function(){
      this.user.currentHealth += 20;
      if(this.user.currentHealth > this.user.totalHealth) this.user.currentHealth = this.user.totalHealth;
    };
    return thing;
  }
  function MinorAttackBuff(){
    let thing = new Card(1, "Minor Atk. Buff", "normal", "Any", false, 0, 0, 0, 0, 20, 0, "Increase attack slightly.", ["(you)'s attacks feels a slight surge of aggression.", "(you)'s attacks feels slightly stronger."]);
    thing.effect = function(){
      pushStatus("Attack Buff", 1, this.user);
    };
    return thing;
  }
  function MinorDefenseBuff(){
    let thing = new Card(1, "Minor Def. Buff", "normal", "Any", false, 0, 0, 0, 0, 20, 0, "Increase defense slightly.", ["(you)'s defense feels slightly sturdier.", "(you)'s defense feels slightly stronger."]);
    thing.effect = function(){
      pushStatus("Defense Buff", 1, this.user);
    };
    return thing;
  }
  function MinorAttackCurse(){
    let thing = new Card(1, "Minor Atk. Curse", "normal", "Any", true, 0, 0, 0, 0, 20, 0, "Decreases enemy Atk. slightly.", ["(you) curses (enemy)'s attacks.", "(enemy)'s attacks feels weaker from curse."]);
    thing.effect = function(){
      pushStatus("Attack Curse", 1, this.target);
    };
    return thing;
  }
  function MinorDefenseCurse(){
    let thing = new Card(1, "Minor Def. Curse", "normal", "Any", true, 0, 0, 0, 0, 20, 0, "Decreases enemy Def. slightly.", ["(you) curses (enemy)'s defense.", "(enemy) defense feels weaker from curse."]);
    thing.effect = function(){
      pushStatus("Defense Curse", 1, this.target);
    };
    return thing;
  }
  function SmallEnergyBall(){
    let thing = new Card(1, "Small Energy Ball", "normal", "Any", true, 0, 8, 0, 0, 0, 35, "A ball of energy.", ["(you) shoot out a ball of energy."]);
    return thing;
  }
  function PoisonBreath(){
    let thing = new Card(2, "Poison Breath", "poison", "Any", true, 0, 8, 0, 0, 40, 0, "Deal damage and inflict Poison.", ["(you) breathes poison onto (enemy).", "(you) covers (enemy) in poison."]);
    thing.effect = function(){
      pushStatus("Poison", 1, this.target);
    };
    return thing;
  }

  function Bite(){
    let thing = new Card(1, "Bite", "normal", "Enemy", true, 4, 0, 0, 0, 0, 20, "Bite your foe.", ["(you) bites (enemy)'s hand.", "(you) cuts (enemy) with its teeth.", "(you) sinks its teeth into (enemy)'s flesh."]);
    thing.effect = function(){
      if(this.target.currentDefense < 4){
        this.user.currentAttack += 2;
      }
    };
    this.endEffect = function(){
      if(this.target){
        if(this.target.currentDefense < 4){
          this.attack += 2;
        }
      }
    };
    return thing;
  }
  function Roar(){
    let thing = new Card(2, "Roar", "normal", "Enemy", true, 0, 0, 0, 0, 5, 20, "Invigorate your allies.", ["(you) lets out a piercing roar. (you)'s allies have attack buffs."]);
    thing.effect = function(){
      for(let i = 0; i < enemies.length; i++){
        pushStatus("Attack Buff", 1, enemies[i]);
      }
    };
    return thing;
  }

  function HeavyAttack(){
    let thing = new Card(1, "Heavy Attack", "normal", "Warrior", true, 12, 0, 0, 0, 0, 30, "A strong attack.", ["(you) bashes in (enemy)'s head.", "(you) deals a crushing blow to (enemy)."]);
    return thing;
  }
  function BloodStrike(){
    let thing = new Card(1, "Blood Strike", "normal", "Warrior", true, 5, 0, 0, 0, 0, 30, "Hit an enemy with lifesteal.", ["(you) feasts on (enemy)'s blood."]);
    thing.effect = function(){
      this.attack += Math.floor(this.user.currentAttack/2);
      if(this.target.race == "Undead"){
        addText(this.user.name + " loses health stealing Undead blood.");
        this.user.currentHealth -= Math.floor(this.user.currentAttack/2);
      } else{
        this.user.currentHealth += Math.floor(this.user.currentAttack + this.user.currentAttack/2);
        if(this.user.currentHealth > this.user.totalHealth) this.user.currentHealth = this.user.totalHealth;
      }
    };
    return thing;
  }
  function FlameSword(){
    let thing = new Card(1, "Flame Sword", "fire", "Warrior", true, 8, 0, 0, 0, 25, 25, "Engulf your sword with fire. Inflict Burn.", ["(you) sets sword on fire.", "(you)'s sword dances in flames."]);
    thing.effect = function(){
      pushStatus("Burn", 1, this.target);
      this.attack += this.user.currentMagicA;
    };
    return thing;
  }

  function Cycle(){
    let thing = new Card(1, "Cycle", "normal", "Rogue", true, 0, 0, 0, 0, 0, 0, "Cycle through all card slots.", ["(you) takes a moment to prepare.", "(you) shuffles around some equipment.", "(you) looks for (enemy)'s weakness."]);
    thing.effect = function(){
      for(let i = 0; i < this.user.slots; i++){
        setCardAt(i);
      }
    };
    return thing;
  }
  function DoubleStrike(){
    let thing = new Card(1, "Double Strike", "normal", "Rogue", true, 5, 0, 0, 0, 0, 20, "Strike twice at enemy.", ["(you) hits (enemy) twice.", "(you) strikes (enemy) twice."]);
    thing.effect = function(){
      this.attack += this.user.currentAttack;
    };
    return thing;
  }
  function Theft(){
    let thing = new Card(1, "Theft", "normal", "Rogue", true, 5, 0, 0, 0, 0, 20, "Hit with a chance to steal item.", ["(you) attempts to pocket (enemy).", "(you) attempts to go through (enemy)'s pockets."]);
    thing.effect = function(){
      let dude = allItemsCategory["Drop"](this.target.level);
      if(!dude) dude = allItemsCategory["Drop"](this.target.level);
      if(!dude) dude = allItemsCategory["Drop"](this.target.level);
      if(dude){
        addText("Sucessfully stole " + dude.name + ".");
        addItemToInventory(dude);
      } else{
        addText("Found nothing to steal.");
      }
    };
    return thing;
  }

  function Fireball(){
    let thing = new Card(1, "Fireball", "fire", "Mage", true, 0, 6, 0, 0, 60, 0, "A ball of fire with AoE. Inflicts minor Burn.", ["(you) conjures a ball of fire.", "An explosion of fire hits (enemy)."]);
    thing.effect = function() {
      pushStatus("Burn", 1, this.target);
      if(this.user == player){
        for(let i = 0; i < enemies.length; i++){
          enemies[i].currentHealth -= 7;
        }
      }
    };
    return thing;
  }
  function MinorFocus(){
    let thing = new Card(1, "Minor Focus", "normal", "Mage", true, 0, 0, 2, 2, 0, 0, "Lose health. Restore mana and stamina. Minor def buff.", ["(you) focuses thought."]);
    thing.effect = function() {
      pushStatus("Defense Buff", 1, this.user);
      this.user.currentHealth -= 15;

      this.user.currentMana += 35;
      if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
      this.user.currentStamina += 35;
      if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
    };
    return thing;
  }
  function LightningStrike(){
    let thing = new Card(1, "Lightning Strike", "thunder", "Mage", true, 0, 15, 0, 0, 50, 0, "Strike one enemy with lightning.", ["(you) sends a bolt of lightning at (enemy).", "(enemy) gets shocked by (you)"]);
    return thing;
  }

  function Job(job){
    let array = [];
    for(let key in allCards){
      let value = allCards[key]();
      if(value) if(value.job == job) if(value.level <= player.level) array.push(value);
    }

    let found = false;
    let dude;

     while(!found){
       dude = array[Math.floor(Math.random() * array.length)];
       if(dude.level + (Math.floor(Math.random() * (player.level - dude.level + 1))) >= player.level + (Math.floor(Math.random() * (player.level - dude.level + 1)))) found = true;
     }

     return dude;
  }
}

function initItems(){
  allItems["Small Health Potion"] = SmallHealthPotion;
  allItems["Small Mana Potion"] = SmallManaPotion;
  allItems["Small Stamina Potion"] = SmallStaminaPotion;
  allItems["Small Elixir"] = SmallElixir;

  allItemsCategory["Drop"] = dropItemByLevel;
  allItemsCategory["Level"] = randomItemByLevel;

  function SmallHealthPotion(){
    let thing = new Item(1, 35, "Small Health Potion", 90, "Restores minor health");
    thing.effect = function(){
      player.currentHealth += 25;
      if(player.currentHealth > player.totalHealth) player.currentHealth = player.totalHealth;
    }
    return thing;
  }
  function SmallManaPotion(){
    let thing = new Item(1, 45, "Small Mana Potion", 100, "Restores minor mana");
    thing.effect = function(){
      player.currentMana += 50;
      if(player.currentMana > player.totalMana) player.currentMana = player.totalMana;
    }
    return thing;
  }
  function SmallStaminaPotion(){
    let thing = new Item(1, 35, "Small Stamina Potion", 90, "Restores minor stamina");
    thing.effect = function(){
      player.currentStamina += 40;
      if(player.currentStamina > player.totalStamina) player.currentStamina = player.totalStamina;
    }
    return thing;
  }
  function SmallElixir(){
    let thing = new Item(1, 15, "Small Elixir", 150, "Minor restore to all stats.");
    thing.effect = function(){
      player.currentHealth += 35;
      if(player.currentHealth > player.totalHealth) player.currentHealth = player.totalHealth;
      player.currentStamina += 35;
      if(player.currentStamina > player.totalStamina) player.currentStamina = player.totalStamina;
      player.currentMana += 35;
      if(player.currentMana > player.totalMana) player.currentMana = player.totalMana;
    }
    return thing;
  }

  function randomItemByLevel(level){
    let array = [];
    for(let key in allItems){
      let value = allItems[key]();
      if(value.level) if(value.level <= level) array.push(value);
    }

    let found = false;

    let dude;

    while(!found){
      dude = array[Math.floor(Math.random() * array.length)];
      let temp_chance = dude.chance * (1 + (level - dude.level));
      if(temp_chance > 95) temp_chance = 95;
      if(temp_chance < Math.floor(Math.random() * 100)) found = true;
    }

    return dude;
  }
  function dropItemByLevel(level){
    let array = [];
    for(let key in allItems){
      let value = allItems[key]();
      if(value.level) if(value.level <= level) array.push(value);
    }

    let dude = array[Math.floor(Math.random() * array.length)];
    let temp_chance = dude.chance * (1 + (level - dude.level));
    if(temp_chance > 80) temp_chance = 80;
    if(temp_chance < Math.floor(Math.random() * 100)) dude = undefined;

    return dude;
  }
}

function initStatus(){
  allStatus["Burn"] = Burn;
  allStatus["Poison"] = Poison;
  allStatus["Bleed"] = Bleed;
  allStatus["Attack Buff"] = AttackBuff;
  allStatus["Defense Buff"] = DefenseBuff;
  allStatus["Attack Curse"] = AttackCurse;
  allStatus["Defense Curse"] = DefenseCurse;

  function Burn(level){
    let thing = new Status(level, "Burn", 3, "	rgb(217, 38, 110)", "(you) takes damage from Burn status.");
    thing.effect = function(){
      let damage = (5 * this.level) - this.user.currentDefense;
      if(damage < 0) damage = 0;
      this.user.currentHealth -= damage;
    }
    return thing;
  }
  function Poison(level){
    let thing = new Status(level, "Poison", 3, "rgb(179, 255, 179)", "(you) takes damage from Poison status.");
    thing.effect = function(){
      let damage = (5 * this.level) - this.user.currentMagicD;
      if(damage < 0) damage = 0;
      this.user.currentHealth -= damage;
    }
    return thing;
  }
  function Bleed(level){
    let thing = new Status(level, "Bleed", 5, "	rgb(255, 102, 163)", "(you) takes damage from Bleed status.");
    thing.effect = function(){
      let damage = (2 * this.level);
      if(damage < 0) damage = 0;
      this.user.currentHealth -= damage;
    }
    return thing;
  }
  function AttackBuff(level){
    let thing = new Status(level, "Attack Buff", 3, "rgb(102, 194, 255)", "(you) has Attack Buff.");
    thing.effect = function(){
      let buff = (1 * this.level);
      this.user.currentAttack += buff;
      this.user.currentMagicA += buff;
    }
    this.endEffect = function(){
      let buff = (1 * this.level) * this.totalCount;
      this.user.currentAttack -= buff;
      this.user.currentMagicA -= buff;
    }
    return thing;
  }
  function DefenseBuff(level){
    let thing = new Status(level, "Defense Buff", 3, "rgb(102, 194, 255)", "(you) has Defense Buff.");
    thing.effect = function(){
      let buff = (1 * this.level);
      this.user.currentDefense += buff;
      this.user.currentMagicD += buff;
    }
    this.endEffect = function(){
      let buff = (1 * this.level) * this.totalCount;
      this.user.currentDefense -= buff;
      this.user.currentMagicD -= buff;
    }
    return thing;
  }
  function AttackCurse(level){
    let thing = new Status(level, "Attack Curse", 3, "rgb(153, 102, 102)", "(you) suffers from Attack Curse.");
    thing.effect = function(){
      let curse = (1 * this.level);
      this.user.currentAttack -= curse;
      this.user.currentMagicA -= curse;
    }
    this.endEffect = function(){
      let curse = (1 * this.level) * this.totalCount;
      this.user.currentAttack += curse;
      this.user.currentMagicA += curse;
    }
    return thing;
  }
  function DefenseCurse(level){
    let thing = new Status(level, "Defense Curse", 3, "rgb(153, 153, 102)", "(you) suffers from Defense Curse.");
    thing.effect = function(){
      let curse = (1 * this.level);
      this.user.currentDefense -= curse;
      this.user.currentMagicD -= curse;
    }
    this.endEffect = function(){
      let curse = (1 * this.level) * this.totalCount;
      this.user.currentDefense += curse;
      this.user.currentMagicD += curse;
    }
    return thing;
  }
}

function initDeck(){
  for(let i = 0; i < 10; i++){
    pushCard("Attack", player);
  }
  for(let i = 0; i < 6; i++){
    pushCard("Do Nothing1", player);
  }

  for(let i = 0; i < 6; i++){
    pushCard("Rest", player);
  }
}


function FloorOne(){
  isActive = false;
  document.getElementById("current-floor").innerHTML = "Floor " + 1;

  setName();
  loop();

  function loop(){
    if(paused){
      loop1();
      function loop1(){
        if(paused) setTimeout(loop1, 0);
        else loop();
      }
    }else{
      if(gen_step == 2){
        nextSeq();
        return;
      }

      setTimeout(loop, 0);
    }
  }

  function nextSeq(){
    gen_step = 0;
    clearText();
    document.getElementById("info").style.visibility = "visible";
    counter = 0;

    loop();

    function loop(){
      if(counter == 300 || counter == 700) addText("...");
      if(counter == 1100) addText("You feel a drop of damp water hit your face.");
      if(counter == 1700) addText("You slowly open your eyes...");
      if(counter == 2400) addText("Your eyes adjust to the dark, dreary chamber.");
      if(counter == 3000) addText("Rats scurry behind spider webs as you lift yourself up.");
      if(counter == 3800) addText("In front of you lies three weapons.");
      if(counter == 4500) {
        addText("&nbsp");
        addText("(1) Sword, (2) Dagger, (3) Staff");
        addText("<p style='color: purple;'>Pick a weapon:</p>");
        options = 3;
        loop1();

        function loop1(){
          isActive = true;
          if(gen_step == 1){
            player = new Character("warrior");
            addText("&nbsp");
            addText("You feel the weight of the sword heavy in your hands.");
          } else if(gen_step == 2){
            player = new Character("rogue");
            addText("&nbsp");
            addText("The dagger feels light as a feather in your hands.");
          } else if(gen_step == 3){
            player = new Character("mage");
            addText("&nbsp");
            addText("You sense a surge of mana flow from the staff.");
          }
          if(gen_step != 0){

            initDeck();

            for(let i = 0; i < 3; i++){
              pushCard(allCardsCategory["Job"](player.job).name, player);
            }

            addItemToInventory(allItemsCategory["Level"](player.level));
            addItemToInventory(allItemsCategory["Level"](player.level));
            addItemToInventory(allItemsCategory["Level"](player.level));
            addItemToInventory(allItemsCategory["Level"](player.level));
            addItemToInventory(allItemsCategory["Level"](player.level));
            addItemToInventory(allItemsCategory["Level"](player.level));
            addItemToInventory(allItemsCategory["Level"](player.level));

            gen_step = 0;
            options = 0;

            counter = 0;
            loop2();

            function loop2(){
              if(counter == 1000){
                isStart = true;
                document.getElementById("deck-list").style.display = "inline-block";
                document.getElementById("inventory-list").style.display = "inline-block";
                addText("You pick up some items lying on the floor.");
              }
              if(counter == 1900) addText("You look ahead and see two doors.");
              if(counter == 2800){
                addText("&nbsp");
                addText("One door has a sign - \"Tutorial\"; the other - \"Floor 1\".");
              }
              if(counter == 3600){
                options = 2;
                isActive = true;
                addText("&nbsp");
                addText("(1) Tutorial, (2) Floor 1");
                addText("<p style='color: purple;'>Which do you take?<p>");
              }
              if(paused){
                setTimeout(loop2, 0);
              } else if(gen_step == 0){
                counter++;
                setTimeout(loop2, 0);
              } else{
                isActive = false;
                options = 0;
                if(gen_step == 1){
                  clearText();
                  tutorial();
                } else{
                  startFloor(current_floor);
                }
              }
            }
          } else setTimeout(loop1, 0);
        }
      } else{
        if(paused){
          setTimeout(loop, 0);
        } else{
          counter++;
          setTimeout(loop, 0);
        }
      }
    }
  }
}

function startFloor(floor){
  clearText();
  addText("You arrive at Floor " + floor);
  current_floor = floor;
  document.getElementById("current-floor").innerHTML = "Floor " + current_floor;

  let race;
  if(floor % 2) race = allEnemiesCategory["Level"](floor);
  else race = allEnemiesCategory["Level"](floor - 1);

  counter = 0;

  loop();

  function loop(){
    if(counter == 800){
      let path = Math.floor(Math.random() * 1000);
      // path = 475;

      if(path >= 0 && path < 50){
        counter = 0;
      }
      else if(path >= 50 && path < 300){
        initiateBattle(race, false);
      }
      else if(path >= 300 && path < 350){
        let temp_counter = 0;
        isActive = false;
        gen_step = 0;
        addText("You found the boss room.");
        bossLoop();

        function bossLoop(){
          if(temp_counter == 500){
            addText("&nbsp");
            addText("(1) Enter, (2) Walk Away");
            addText("<p style='color: purple'>Do you Enter?</p>");
            isActive = true;
            options = 2;
          }
          if(paused){
            setTimeout(bossLoop, 0);
          } else if(gen_step == 0){
            temp_counter++;
            setTimeout(bossLoop, 0);
          } else if(gen_step == 1){
            bossFight = true;
            initiateBattle(race, true);
          } else if(gen_step == 2){
            addText("You take a step back to look around some more.");
            gen_step = 0;
            isActive = false;
            options = 0;
            counter = 0;
          }
        }
      }
      else if(path >= 350 && path < 450){
        isActive = false;
        let temp_counter = 0;
        gen_step = 0;
        addText("&nbsp");
        addText("You hear a whisper from inside a cracked wall.");
        shopkeepLoop();

        function shopkeepLoop(){
          if(temp_counter == 650){
            addText("H.. Hey, " + player.name + ".");
          } else if(temp_counter == 1100){
            addText("You looking fo..for some goods?");
          } else if(temp_counter == 1600){
            addText("&nbsp");
            addText("(1) Look at items, (2) Buy Packs, (3) Walk Away.");

            isActive = true;
            options = 3;
          }
          if(paused){
            setTimeout(shopkeepLoop, 0);
          } else{
            if(gen_step != 0){
              isActive = false;
              shopKeeperLock = 0;
              shopKeeperItems = {};
              looperony();

              function looperony(){
                if(gen_step == 3){
                  clearText();
                  addText("Until N..Next Time..");
                  gen_step = 0;
                  isActive = false;
                  options = 0;
                  counter = 0;
                } else if(gen_step == 1){
                  gen_step = 0;
                  itemsLoop();

                  function itemsLoop(){
                    let temp_items = {};
                    if(gen_step == 0){
                      if(shopKeeperLock == 0){
                        let temp_rand = Math.floor(Math.random() * 4) + 1;
                        for(let i = 0; i < temp_rand; i++){
                          let random_item = allItemsCategory["Level"](player.level);
                          shopKeeperItems[random_item.name] = (shopKeeperItems[random_item.name] || 0) + 1;
                        }
                        shopKeeperLock = 1;
                      }

                      clearText();
                      let temp_num = 2;
                      for(let key in shopKeeperItems){
                        temp_items[temp_num++] = key;
                      }

                      options = Object.keys(temp_items).length + 1;

                      for(let i = options; i > 1; i--){
                        addText("<span style='color: purple'>(" + i + ")</span> x" + shopKeeperItems[temp_items[i]] + " " + temp_items[i] + ": " + allItems[temp_items[i]]().cost + " gold.", true);
                      }

                      addText("<span style='color: purple;'>(1)</span> Go Back", true);
                      addText("Remaining Gold: " + player.gold, true);

                      isActive = true;

                      gen_step = -1;
                      setTimeout(itemsLoop, 0);

                    } else if(gen_step == -1){
                      setTimeout(itemsLoop, 0);
                    } else if(gen_step == 1){
                      isActive = false;
                      gen_step = -1;
                      looperony();
                    } else{
                      let temp_num = 2;
                      for(let key in shopKeeperItems){
                        temp_items[temp_num++] = key;
                      }
                      isActive = false;

                      let chosenOne = allItems[temp_items[gen_step]]();
                      if(player.gold > chosenOne.cost){
                        player.gold -= chosenOne.cost;
                        addItemToInventory(chosenOne);
                        addText("&nbsp", true);
                        addText(chosenOne.name + " purchased for " + chosenOne.cost + " gold.", true);
                        shopKeeperItems[chosenOne.name] = shopKeeperItems[chosenOne.name] - 1;
                        if(shopKeeperItems[chosenOne.name] == 0){
                          delete shopKeeperItems[chosenOne.name];
                        }
                      } else{
                        addText("You don't have enough gold for that item.", true);
                      }

                      gen_step = 0;
                      itemsLoop();
                    }
                  }
                } else if(gen_step == 2){
                  gen_step = 0;
                  packsLoop();

                  function packsLoop(){
                    if(gen_step == 0){
                      clearText();
                      addText("<span style='color: purple'>(2)</span> Buy Pack: 1000 gold.", true);
                      addText("<span style='color: purple'>(1)</span> Go Back", true);
                      addText("Remaining Gold: " + player.gold, true);

                      options = 2;
                      isActive = true;
                      gen_step = -1;

                      packsLoop();
                    }
                    else if(gen_step == -1){
                      setTimeout(packsLoop, 0);
                    }
                    else if(gen_step == 1){
                      isActive = false;
                      gen_step = -1;
                      looperony();
                    }
                    else if(gen_step == 2){
                      isActive = false;
                      if(player.gold >= 1000){
                        player.gold -= 1000;

                        buyPack();

                        function buyPack(){
                          let pack = [];


                          pack.push(allCardsCategory["Job"](player.job));
                          if(Math.floor(Math.random() * 2)) pack.push(allCardsCategory["Job"]("Any"));
                          else pack.push(allCardsCategory["Job"](player.job));
                          pack.push(allCardsCategory["Job"]("Any"));
                          pack.push(allCardsCategory["Job"]("Any"));
                          pack.push(allCardsCategory["Job"]("Any"));

                          gen_step = 0;

                          let remaining = 3;

                          packerLoop();

                          function packerLoop(){
                            if(gen_step == 0){
                              clearText();
                              options = pack.length;
                              isActive = true;

                              for(let i = options; i > 0; i--){
                                addText("<span style='color: purple;'>(" + i + ")</span> " + pack[i-1].name + ": " + pack[i-1].description, true);
                              }
                              addText("Choose three: " + remaining, true);

                              gen_step = -1;
                              packerLoop();
                            }
                            else if(gen_step == -1){
                              setTimeout(packerLoop, 0);
                            }
                            else if(gen_step != 0){
                              isActive = false;
                              pushCard(pack[gen_step - 1].name, player);
                              pack.splice(gen_step - 1, 1);
                              remaining--;
                              gen_step = 0;
                              if(remaining == 0){
                                packsLoop();
                              } else{
                                packerLoop();
                              }
                            }
                          }
                        }
                      } else{
                        gen_step = 0;
                        packsLoop();
                      }
                    }
                  }
                } else if(gen_step == -1){
                  options = 3;
                  isActive = true;
                  gen_step = 0;
                  clearText();
                  addText("(1) Look at items, (2) Buy Packs, (3) Walk Away.");
                  setTimeout(looperony, 0);
                } else if(gen_step == 0){
                  setTimeout(looperony, 0);
                }
              }
            } else{
              temp_counter++;
              setTimeout(shopkeepLoop, 0);
            }
          }
        }
      }
      else if(path >= 450 && path < 500){
        gen_step = 0;
        isActive = false;
        let temp_counter = 0;
        let temp_finding;
        let temp_used = false;
        let temp_cost = randomNum(200, 25);
        demChoices();

        function demChoices(){
          if(temp_counter == 0){
            temp_finding = Math.floor(Math.random() * 2);
            addText("&nbsp");
            if(temp_finding == 0){
              addText("You come across a whirling, mechanical box.");
            } else if(temp_finding == 1){
              addText("You come across a glowing pool of water.");
            }

          } else if(temp_counter == 700){
            if(temp_finding == 0){
              addText("&nbsp");
              addText("The machine gives out steam and opens up.");
            } else if(temp_finding == 1){
              addText("&nbsp");
              addText("The glowing body of water pulsates.");
            }
          } else if(temp_counter == 1400){
            clearText();
            addText("(2) Walk away.", true);
            addText("<span style='color: purple;'>(1) Heal: </span>" + temp_cost + " gold.", true);
            addText("Remaining Gold: " + player.gold, true);

            options = 2;
            isActive = true;
            gen_step = 0;
          }
          if(paused) setTimeout(demChoices, 0);
          else if(gen_step == 0){
            temp_counter++;
            setTimeout(demChoices, 0);
          } else if(gen_step == 1){
            isActive = false;

            if(player.gold > temp_cost){
              player.gold -= temp_cost;
              player.currentHealth += 35;
              if(player.currentHealth > player.totalHealth) player.currentHealth = player.totalHealth;
              player.currentStamina += 35;
              if(player.currentStamina > player.totalStamina) player.currentStamina = player.totalStamina;
              player.currentMana += 35;
              if(player.currentMana > player.totalMana) player.currentMana = player.totalMana;
              temp_used = true;
              checkStats();
            }
            temp_counter = 1900;
            gen_step = 0;
            setTimeout(demChoices, 0);
          } else if(gen_step == 2){
            clearText();
            if(temp_used){
              if(temp_finding) addText("You walk away feeling refreshed.");
              else addText("You walk away feeling stronger.");
            } else addText("You walk away.");
            counter = 0;
          }
        }
      }
      else if(path >= 500 && path < 1000){
        myriad();
        function myriad(){
          addText("&nbsp");
          let random = Math.floor(Math.random() * 10);
          if(random >= 0 && random < 5){
            let texts = [];
            texts.push("An omnious feeling creeps up your back.");
            texts.push("You feel a slight breeze blow past you.");
            texts.push("You feel eyes watching you from the shadows.");
            texts.push("Candles dimly illuminate your way.");
            texts.push("You hear droplets echo in the distance.");
            texts.push("You make your way to the next room.");
            texts.push("The cold sends shivers down your spine.");

            let randomo = Math.floor(Math.random() * texts.length);
            addText(texts[randomo]);
          } else if(random >= 5 && random < 8){
            let texts = [];
            texts.push("There is a barred window that you can barely make out whats outside.");
            texts.push("The small candles flicker, making the shadows dance.");
            texts.push("The damp air wraps around your body.");
            texts.push("You see movement in the shadows.");
            texts.push("Water splashes as you step in a puddle.");
            texts.push("You push through an old, rotting door.");
            texts.push("Rats scurry away as you enter the next room.");

            let randomo = Math.floor(Math.random() * texts.length);
            addText(texts[randomo]);
          } else if(random >= 8 && random < 10){
            let texts = [];
            texts.push("You feel the tower slightly rumble.");
            texts.push("Something smells rotten.");
            texts.push("There are broken pieces of glass and wood on the floor.");
            texts.push("You come across a stretched out hallway.");
            texts.push("The cold, stone walls do not feel inviting.");
            texts.push("Moonlight pierces through the cracks of the barred window.")

            let randomo = Math.floor(Math.random() * texts.length);
            addText(texts[randomo]);
          }

          counter = 0;
        }
      }
    }
    let trigger = false;

    if(bossFight == true){
      return;
    } else if(paused){
      setTimeout(loop, 0);
    } else{
      counter++;
      setTimeout(loop, 0);
    }
  }
}

function tutorial(){
  counter = 0;
  isTutorial = true;
  loop();

  function loop(){
    if(counter == 400) addText("You push open the door labeled \"Tutorial\".");
    if(counter == 1200) addText("But then realize that the dev hasn't added a real tutorial yet.");
    if(counter == 2100) addText("(sorry).");
    if(counter == 2600) addText("Some tips though:");
    if(counter == 3200) addText("1) Green bar is Health, yellow bar is Stamina, blue bar is Mana, and Pink bar is experience points.");
    if(counter == 4400) addText("2) You can press \"i\" and \"d\" at anytime to open/close inventory and deck list.");
    if(counter == 5400) addText("3) (Add more to this list?).");
    if(counter == 6000) addText("(sorry again).");
    if(counter == 6600) addText("You wonder what that was about and continue onwards.");
    if(counter == 7500){
      startFloor(current_floor);
    } else{
      if(paused){
        setTimeout(loop, 0);
      } else{
        counter++;
        setTimeout(loop, 0);
      }
    }
  }
}

function setName(){
  gen_step = 0;
  loop();

  function loop(){
    if(gen_step == 0){
      addText("&nbsp");
      addText("<button id='name-button' class='button'>Submit</button>");
      addText("<input id='name-input' type='text'></input>");
      addText("What is your name?");
      document.getElementById("name-button").addEventListener("click", submitName);
      gen_step = 1;
    }
    if(gen_step == 2) return;

    setTimeout(loop, 0);

    function submitName(){
      let proposed_name = document.getElementById("name-input").value;
      if(proposed_name.replace(/\s/g, '').length && !proposed_name.includes("<") && proposed_name.length > 1 && proposed_name.length < 16){
        p_name = proposed_name;
        document.getElementById("info-name").innerHTML = p_name;
        gen_step = 2;
      } else {
        document.getElementById("name-input").style.backgroundColor = "#ffe6e6";
      }
    }
  }
}

function start(){
  FloorOne();
}


function initiateBattle(race, boss){
  enemies = [];
  dead_enemies = [];

  let enemy_amount = allEnemiesCategory["Count"](race);

  if(boss){
    if(Math.floor(Math.random() * (6 - enemy_amount))) enemies.push(allEnemiesCategory["Race"](race, false));
    enemies.push(allEnemiesCategory["Race"]((race), true));
    if(enemy_amount > 2) if(Math.floor(Math.random() * (6 - enemy_amount))) enemies.push(allEnemiesCategory["Race"](race, false));
  } else{
    let looper = Math.floor(Math.random() * enemy_amount) + 1;
    for(let i = 0; i < looper; i++){
      enemies.push(allEnemiesCategory["Race"](race, false));
    }
  }

  startBattle(enemies);
}

function startBattle(enemies){
  isBattle = true;

  document.getElementById("characters").style.display = "block";
  document.getElementById("cards").style.display = "block";
  document.getElementById("info-2").style.display = "none";

  document.getElementById("board").style.backgroundColor = "rgb(255, 250, 250)";

  //Set enemies on board
  for(let i = 0; i < enemies.length; i++){
    let node = document.createElement("div");
    node.id = "enemy" + i;
    node.classList.add("enemy");
    document.getElementById("enemies").appendChild(node);

    let tempStatus = document.createElement("p");
    tempStatus.innerHTML = "<span>&nbsp</span>";
    tempStatus.id = "enemy-status" + i;
    document.getElementById("enemy" + i).appendChild(tempStatus);

    let tempName = document.createElement("p");
    tempName.innerHTML = enemies[i].name;
    document.getElementById("enemy" + i).appendChild(tempName);

    let tempHealth = document.createElement("p");
    tempHealth.innerHTML = "&nbsp";
    tempHealth.id = "enemy-health" + i;
    tempHealth.style.marginLeft = proportions(enemies[i].totalHealth, enemies[i].currentHealth, 5) + "%";
    tempHealth.style.marginRight = proportions(enemies[i].totalHealth, enemies[i].currentHealth, 5) + "%";
    tempHealth.style.backgroundColor = "rgb(" + colorProportions(enemies[i].totalHealth, enemies[i].currentHealth, 255) + ",150,0)";
    document.getElementById("enemy" + i).appendChild(tempHealth);
  }

  //Set player on board
  document.getElementById("player-name").innerHTML = player.name;

  checkStats();

  //Set current deck to tempDeck for battle.
  for(let i = 0; i < deck.length; i++){
    tempDeck.push(deck[i]);
  }

  shuffle(tempDeck);
  setSlots();

  battle(enemies);
}

function setSlots(){
  for(let i = 0; i < player.slots; i++){
    let node = document.createElement("div");
    node.classList.add("card");
    node.id = "c" + i;
    document.getElementById("cards").insertBefore(node, document.getElementById("deck"));

    let tempNumber = document.createElement("h6");
    tempNumber.innerHTML = i + 1;
    document.getElementById("c" + i).appendChild(tempNumber);

    let tempName = document.createElement("h3");
    tempName.id = "c" + i + "-name";
    document.getElementById("c" + i).appendChild(tempName);

    let tempType = document.createElement("h5");
    tempType.id = "c" + i + "-type";
    document.getElementById("c" + i).appendChild(tempType);

    let tempDes = document.createElement("h5");
    tempDes.id = "c" + i + "-description";
    document.getElementById("c" + i).appendChild(tempDes);

    setCardAt(i);
  }
}

function battle(enemies){
  addText("&nbsp");

  for(let i = 0; i < enemies.length; i++){
    addText(enemies[i].encounterSpeech());
  }

  for(let i = 0; i < player.slots; i++){
    document.getElementById("c" + i).addEventListener("click", buttonPress);
  }

  loop();

  function loop(){
    if(player.currentHealth <= 0){
      endBattle("died");
    } else if(enemies.length == 0){
      endBattle("win");
    } else{
      isActive = true;

      //ButtonPress activation is happening here;
      let temp = false
      for(let i = enemies.length - 1; i >= 0; i--){
        if(enemies[i].currentHealth <= 0){
          addText(enemies[i].deathSpeech());
          removeElement(document.getElementById("enemy" + i));
          dead_enemies.push(enemies[i]);
          enemies.splice(i, 1);
          temp = true;
        }
      }
      if(temp){
        for(let j = 1; j < document.getElementById("enemies").childNodes.length; j++){
          document.getElementById("enemies").childNodes[j].id = "enemy" + (j - 1);
          document.getElementById("enemies").childNodes[j].childNodes[0].id = "enemy-status" + (j - 1);
          document.getElementById("enemies").childNodes[j].childNodes[2].id = "enemy-health" + (j - 1);
        }
      }
      if(paused){
        loop1();
        function loop1(){
          if(paused) setTimeout(loop1, 0);
          else loop();
        }
      } else{
          setTimeout(loop, 0);
      }
    }
  }
}

function endBattle(result){
  //loot
  isBattle = false;
  gen_step = 0;

  document.getElementById("cards").style.display = "none";

  addText("&nbsp");
  let result_loot = [];
  total_gold = 0;
  for(let i = 0; i < dead_enemies.length; i++){
    player.currentExp += dead_enemies[i].exp

    total_gold += dead_enemies[i].gold;
    player.gold += dead_enemies[i].gold;
    let drop = loot(dead_enemies[i].level);
    if(drop){
      addItemToInventory(drop);
      result_loot.push(drop.name);
    }
  }

  result_loot.push(total_gold + " gold");

  let result_text = "Loot: ";

  for(let i = 0; i < result_loot.length; i++){
    if(i == result_loot.length - 1){
      result_text += result_loot[i] + ".";
    } else result_text += result_loot[i] + ", ";
  }

  if(result == "died"){
    result_text = "You died.";
  } else if(result == "cards"){
    result_text = "You ran out of cards.";
  }

  addText(result_text);

  options = 0;
  setTimeout(con, 1500);

  function con(){
    addText("<p style='color: purple'>(1) Continue</p>");
    isActive = true;
    gen_step = 0;
    options = 1;
  }

  loop();

  function loop(){
    if(paused){
      setTimeout(loop, 0);
    } else{
      if(gen_step == 0){
        setTimeout(loop, 0);
      } else{
        let points = 0;
        while(player.currentExp >= player.totalExp){
          player.currentHealth += Math.floor(player.totalHealth/2);
          if(player.currentHealth > player.totalHealth) player.currentHealth = player.totalHealth;
          player.currentStamina += Math.floor(player.totalStamina/2);
          if(player.currentStamina > player.totalStamina) player.currentStamina = player.totalStamina;
          player.currentMana += Math.floor(player.totalMana/2);
          if(player.currentMana > player.totalMana) player.currentMana = player.totalMana;

          points++;
          player.level++;
          player.currentExp -= player.totalExp;
          player.totalExp += player.totalExp/2;
        }

        checkStats();
        gen_step = 0;
        isActive = false;
        levelUpLoop();

        function levelUpLoop(){
          if(gen_step == 0){
            if(points == 0 || player.currentHealth <= 0){
              gen_step = -2;
              levelUpLoop();
              return;
            }
            clearText();
            addText("<span style='color: purple;'>(4)</span> Endurance: Defense, Magic Defense", true);
            addText("<span style='color: purple;'>(3)</span> Aggression: Damage, Magic Damage", true);
            addText("<span style='color: purple;'>(2)</span> Intellgence: HP, Mana.", true);
            addText("<span style='color: purple;'>(1)</span> Strength: HP, Stamina", true);
            addText("Remaining Points: " + points, true);
            addText("You Leveled Up!", true);

            isActive = true;
            options = 4;
            gen_step = -1;
            levelUpLoop();
          } else if(gen_step == -1){
            setTimeout(levelUpLoop, 0);
          } else if(gen_step == -2){
            if(result == "died" || result == "cards"){
              gameOver();
            } else{
              //Cleanup Step
              isActive = false;
              clearText();

              document.getElementById("board").style.backgroundColor = "rgb(255, 255, 255)";
              document.getElementById("characters").style.display = "none";
              document.getElementById("info-2").style.display = "block";

              player.currentAttack = player.totalAttack;
              player.currentMagicA = player.totalMagicA;
              player.currentDefense = player.totalMagicD;
              player.currentMagicD = player.totalMagicD;

              player.status = [];
              statusEffect(player);
              enemies = [];
              dead_enemies = [];
              tempDeck = [];
              current_cards = [];
              counter = 0;
              gen_step = 0;

              for(let i = 0; i < player.slots; i++){
                removeElement(document.getElementById("c" + i));
              }

              addText("&nbsp");
              if(bossFight){
                bossFight = false;
                startFloor(++current_floor);
              }
            }
          } else{
            if(gen_step == 1){
              player.totalHealth += 25;
              player.currentHealth += 25;
              player.totalStamina += 25;
              player.currentStamina += 25;
            } else if(gen_step == 2){
              player.totalHealth += 25;
              player.currentHealth += 25;
              player.totalMana += 25;
              player.currentMana += 25;
            } else if(gen_step == 3){
              player.totalAttack += 2;
              player.currentAttack += 2;
              player.totalMagicA += 2;
              player.currentMagicA += 2;
            } else if(gen_step == 4){
              player.totalDefense += 1;
              player.currentDefense += 1;
              player.totalMagicD += 1;
              player.currentMagicD += 1;
            }

            player.currentAttack = player.totalAttack;
            player.currentMagicA = player.totalMagicA;
            player.currentDefense = player.totalMagicD;
            player.currentMagicD = player.totalMagicD;

            checkStats();
            gen_step = 0;
            isActive = false;
            points--;
            levelUpLoop();
          }

        }
      }
    }
  }
}

function loot(level){
  return allItemsCategory["Drop"](level);
}


function statusEffect(user, index){
  let id_name;
  if(user == player) id_name = "player-status";
  else id_name = "enemy-status" + index;

  let statusNode = document.getElementById(id_name);
  while (statusNode.firstChild) {
      statusNode.removeChild(statusNode.firstChild);
  }

  newNode = document.createElement("span");
  newNode.innerHTML = "&nbsp";
  document.getElementById(id_name).appendChild(newNode);

  for(let i = user.status.length - 1; i >= 0; i--){
    let newNode = document.createElement("span");
    newNode.innerHTML = "&nbsp&nbsp";
    newNode.style.backgroundColor = user.status[i].color;
    document.getElementById(id_name).appendChild(newNode);

    newNode = document.createElement("span");
    newNode.innerHTML = "&nbsp";
    document.getElementById(id_name).appendChild(newNode);

    user.status[i].effect();
    let temp_text = user.status[i].speech.replace(/\(you\)/g, user.name);
    addText(temp_text);
    user.status[i].count -= 1;
    if(user.status[i].count == 0){
      user.status[i].endEffect();
      user.status.splice(i, 1);
    }
  }
}

function pushStatus(name, level, user){
  for(let i = user.status.length - 1; i >= 0; i--){
    if(user.status[i].name == name){
      user.status[i].endEffect();
      user.status.splice(i, 1);
    }
  }

  let temp_status = allStatus[name](level);
  temp_status.user = user;
  user.status.push(temp_status);
}


function activateCard(cardNum, target){
  isActive = false;

  if(battleStep == 0){
    if(!current_cards[cardNum].choice || enemies.length == 1){
      let eCard = enemies[0].cards[Math.floor(Math.random() * enemies[0].cards.length)];
      let pCard = current_cards[cardNum];

      addText("&nbsp");

      if(useCard(pCard, eCard, enemies[0])){
        setCardAt(cardNum);
      }
      for(let i = 0; i < enemies.length; i++){
        eCard = enemies[i].cards[Math.floor(Math.random() * enemies[i].cards.length)];
        useCard(eCard, pCard, player);
        statusEffect(enemies[i], i);
      }
      statusEffect(player);

      document.getElementById("c" + cardNum).style.border = "none";

    } else{
      loop();
      battleStep = 1;
      let text = "Choose Targets for " + current_cards[cardNum].name + ": ";
      for(let i = 0; i < enemies.length; i++){
        if(i == enemies.length - 1) text += "(" + (i + 1) + ")" + enemies[i].name + ".";
        else text += "(" + (i + 1)+ ")" + enemies[i].name + ", ";
      }
      addText(text);

      function loop(){
        if(paused){
          loop1();
          function loop1(){
            if(paused) setTimeout(loop1, 0);
            else loop();
          }
        } else{
            if(battleStep == 1) setTimeout(loop, 0);
        }
      }

    }
  } else if(battleStep == 1){
    let eCard = enemies[target].cards[Math.floor(Math.random() * enemies[target].cards.length)];
    let pCard = current_cards[cardNum];

    addText("&nbsp");

    if(useCard(pCard, eCard, enemies[target])){
      setCardAt(cardNum);
    }
    for(let i = 0; i < enemies.length; i++){
      eCard = enemies[i].cards[Math.floor(Math.random() * enemies[i].cards.length)];
      useCard(eCard, pCard, player);
      statusEffect(enemies[i], i);
    }
    statusEffect(player);
    document.getElementById("c" + cardNum).style.border = "none";
    battleStep = 0;
  }

  // document.getElementById("c" + cardNum).style.border = "";
  isActive = true;
}

function useCard(uCard, tCard, target){
  if(uCard.user == player && uCard.user.currentStamina < uCard.stamina){
    addText(uCard.user.name + " does not have enough stamina.");
    return false;
  } else if(uCard.user == player && uCard.user.currentMana < uCard.mana){
    addText(uCard.user.name + " does not have enough mana.");
    return false;
  } else {
    if(uCard.user == player){
      uCard.user.currentStamina -= uCard.stamina;
      uCard.user.currentMana -= uCard.mana;
    }
    uCard.target = target;
    uCard.effect();
    let pDamage = (uCard.attack + uCard.user.currentAttack) - (tCard.defense + target.currentDefense);
    if(uCard.attack == 0 || pDamage < 0) pDamage = 0;
    let mDamage = (uCard.magicA + uCard.user.currentMagicA) - (tCard.magicD + target.currentMagicD);
    if(uCard.magicA == 0 || mDamage < 0) mDamage = 0;
    let damage = pDamage + mDamage;
    let text = uCard.speech().replace(/\(you\)/g, uCard.user.name).replace(/\(enemy\)/, target.name).replace(/\(damage\)/, damage);
    addText(text);
    target.currentHealth -= damage;
    uCard.endEffect();
    checkStats();
    return true;
  }
}

function pushCard(cardName, user){
  let thing = allCards[cardName]();
  thing.user = user;

  if(user != player){
    user.cards.push(thing);
  } else{
    deck.push(thing);
  }
}

function setCardAt(num){
  if (!Array.isArray(tempDeck) || !tempDeck.length) {
    endBattle("cards");
    return;
  }
  let nextCard = tempDeck.pop();
  document.getElementById("deck-current").innerHTML = tempDeck.length;
  current_cards[num] = nextCard;

  document.getElementById("c" + num + "-name").innerHTML = current_cards[num].name;
  document.getElementById("c" + num + "-type").innerHTML = current_cards[num].type;
  document.getElementById("c" + num + "-description").innerHTML = current_cards[num].description;
}


function Character(job){
  let tempCard;

  if(job == "warrior"){
    this.name = p_name;
    this.job = "Warrior";
    this.totalHealth = 125;
    this.totalAttack = 5;
    this.totalMagicA = 1;
    this.totalDefense = 3;
    this.totalMagicD = 1;
    this.totalMana = 60;
    this.totalStamina = 125;
    this.slots = 3;

  } else if(job == "rogue"){
    this.name = p_name;
    this.job = "Rogue"
    this.totalHealth = 115;
    this.totalAttack = 3;
    this.totalMagicA = 3;
    this.totalDefense = 2;
    this.totalMagicD = 2;
    this.totalMana = 90;
    this.totalStamina = 90;
    this.slots = 4;
  } else if(job == "mage"){
    this.name = p_name;
    this.job = "Mage";
    this.totalHealth = 100;
    this.totalAttack = 1;
    this.totalMagicA = 5;
    this.totalDefense = 1;
    this.totalMagicD = 3;
    this.totalMana = 125;
    this.totalStamina = 65;
    this.slots = 3;
  }

  this.level = 1;
  this.totalExp = 100;
  this.gold = randomNum(950, 49);
  this.currentExp = 0;
  this.currentHealth = this.totalHealth;
  this.currentAttack = this.totalAttack;
  this.currentMagicA = this.totalMagicA;
  this.currentDefense = this.totalDefense;
  this.currentMagicD = this.totalMagicD;
  this.currentMana = this.totalMana;
  this.currentStamina = this.totalStamina;
  this.status = [];
}

function Enemy(eLevel, eExp, eGold, eChance, eName, eRace, eType, eHealth, eAttack, eMagicA, eDefense, eMagicD, eCards, eEncounter, elowHealth, eDeath){
  this.level = eLevel;
  this.exp = eExp;
  this.gold = eGold;
  this.chance = eChance;
  this.name = eName;
  this.type = eType;
  this.race = eRace;
  this.totalHealth = eHealth;
  this.currentHealth = this.totalHealth;
  this.totalAttack = eAttack;
  this.currentAttack = this.totalAttack;
  this.totalMagicA = eMagicA;
  this.currentMagicA = this.totalMagicA;
  this.totalDefense = eDefense;
  this.currentDefense = this.totalDefense;
  this.totalMagicD = eMagicD;
  this.currentMagicD = this.totalMagicD;
  this.totalStamina = 0;
  this.currentStamina = 0;
  this.totalMana = 0;
  this.currentMana = 0;
  this.cards = eCards;
  this.encounterWords = eEncounter;
  this.damagedWords = elowHealth;
  this.deathWords = eDeath;
  this.status = [];
  this.deathSpeech = function(){
    return this.deathWords[Math.floor(Math.random() * this.deathWords.length)];
  };
  this.damagedSpeech = function(){
    return this.damagedWords[Math.floor(Math.random() * this.damagedWords.length)];
  };
  this.encounterSpeech = function(){
    return this.encounterWords[Math.floor(Math.random() * this.encounterWords.length)];
  };
}

function Card(cardLevel, cardName, cardType, cardJob, cardChoice, cardAttack, cardMagicA, cardDefense, cardMagicD, cardMana, cardStamina, cardDescription, cardSpeech){
  this.level = cardLevel;
  this.user = undefined;
  this.target = undefined;
  this.name = cardName;
  this.type = cardType;
  this.choice = cardChoice;
  this.job = cardJob;
  this.attack = cardAttack;
  this.magicA = cardMagicA;
  this.defense = cardDefense;
  this.magicD = cardMagicD;
  this.mana = cardMana;
  this.stamina = cardStamina;
  this.speeches = cardSpeech;
  this.effect = function(){ };
  this.endEffect = function(){ };
  this.speech = function(){
    return this.speeches[Math.floor(Math.random() * this.speeches.length)];
  };
  this.description = cardDescription;
}

function Status(level, name, count, color, speech){
  this.level = level;
  this.user = undefined;
  this.name = name;
  this.count = count;
  this.totalCount = count;
  this.color = color;
  this.speech = speech;
  this.effect = function(){ };
  this.endEffect = function(){ };
}

function Item(level, chance, name, cost, description){
  this.level = level;
  this.name = name;
  this.cost = cost;
  this.chance = chance;
  this.description = description;
  this.effect = function(){ };
}


function addText(text, fade){
  if(text != " "){
    let newP = document.createElement("p");
    newP.innerHTML = text;
    document.getElementById("text").prepend(newP);
    if(!fade){
      for(let i = 0; i < document.getElementById("text").childElementCount; i++){
        let color = i * 18;
        document.getElementById("text").children.item(i).style.color = "rgb(" + color + "," + color + "," + color + ")"
      }
    } else{
      for(let i = 0; i < document.getElementById("text").childElementCount; i++){
        document.getElementById("text").children.item(i).style.color = "rgb(0, 0, 0)";
      }
    }
    if(document.getElementById("text").childElementCount > 11){
      for(let i = 0; i < document.getElementById("text").childElementCount - 11; i++){
        removeElement(document.getElementById("text").lastElementChild);
      }
    }
  }
}

function clearText(){
  for(let i = 0; i < document.getElementById("text").childElementCount; i++){
    document.getElementById("text").children.item(i).innerHTML = "";
  }
}


function removeElement(element){
  element.parentNode.removeChild(element);
}

function checkStats(){
  for(let i = 0; i < enemies.length; i++){
    document.getElementById("enemy-health" + i).style.marginLeft = proportions(enemies[i].totalHealth, enemies[i].currentHealth, 5) + "%";
    document.getElementById("enemy-health" + i).style.marginRight = proportions(enemies[i].totalHealth, enemies[i].currentHealth, 5) + "%";
    document.getElementById("enemy-health" + i).style.backgroundColor = "rgb(" + colorProportions(enemies[i].totalHealth, enemies[i].currentHealth, 255) + ",150,0)";
  }
  document.getElementById("player-level").innerHTML = "lvl " + player.level;

  document.getElementById("player-health").style.marginLeft = proportions(player.totalHealth, player.currentHealth, 35) + "%";
  document.getElementById("player-health").style.marginRight = proportions(player.totalHealth, player.currentHealth, 35) + "%";
  document.getElementById("player-health").style.backgroundColor = "rgb(" + colorProportions(player.totalHealth, player.currentHealth, 255) + ",150,0)";

  document.getElementById("player-stamina").style.marginLeft = proportions(player.totalStamina, player.currentStamina, 35) + "%";
  document.getElementById("player-stamina").style.marginRight = proportions(player.totalStamina, player.currentStamina, 35) + "%";
  document.getElementById("player-stamina").style.backgroundColor = "rgb(255, 255, 70)";

  document.getElementById("player-mana").style.marginLeft = proportions(player.totalMana, player.currentMana, 35) + "%";
  document.getElementById("player-mana").style.marginRight = proportions(player.totalMana, player.currentMana, 35) + "%";
  document.getElementById("player-mana").style.backgroundColor = "rgb(150, 235, 255)";

  document.getElementById("player-health-2").style.marginLeft = proportions(player.totalHealth, player.currentHealth, 35) + "%";
  document.getElementById("player-health-2").style.marginRight = proportions(player.totalHealth, player.currentHealth, 35) + "%";
  document.getElementById("player-health-2").style.backgroundColor = "rgb(" + colorProportions(player.totalHealth, player.currentHealth, 255) + ",150,0)";

  document.getElementById("player-stamina-2").style.marginLeft = proportions(player.totalStamina, player.currentStamina, 35) + "%";
  document.getElementById("player-stamina-2").style.marginRight = proportions(player.totalStamina, player.currentStamina, 35) + "%";
  document.getElementById("player-stamina-2").style.backgroundColor = "rgb(255, 255, 70)";

  document.getElementById("player-mana-2").style.marginLeft = proportions(player.totalMana, player.currentMana, 35) + "%";
  document.getElementById("player-mana-2").style.marginRight = proportions(player.totalMana, player.currentMana, 35) + "%";
  document.getElementById("player-mana-2").style.backgroundColor = "rgb(150, 235, 255)";

  document.getElementById("player-exp").style.marginLeft = proportions(player.totalExp, player.currentExp, 35) + "%";
  document.getElementById("player-exp").style.marginRight = proportions(player.totalExp, player.currentExp, 35) + "%";
  document.getElementById("player-exp").style.backgroundColor = "rgb(255, 179, 230)";
}

function randomNum(base, variance){
  let result;
  if(Math.floor(Math.random() * 2) == 0) result = base + Math.floor(Math.random() * (variance + 1));
  else result = base - Math.floor(Math.random() * (variance + 1));
  return result;
}

//Set proportions for margin %
function proportions(total, current, target){
  let ratio = 1 - (current/total);
  let result = target + ((50 - target) * ratio);
  if(result > 50) result = 50;
  return result;
}

function colorProportions(total, current, target){
  let ratio = current/total;
  let result = target - (target * ratio);
  if(result < 0) result = 0;
  return result;
}

//Fisher-Yates Shuffle
function shuffle(array){
  let currentIndex = array.length, temporaryValue, randomIndex;

  while(0 !== currentIndex){
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function gameOver(){
  console.log("Game Over");
  clearText();
  isBattle = false;
  isActive = false;
  isStart = false;
  location.reload(true);
}
