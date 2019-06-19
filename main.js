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

let isTesting = true;

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

  if(isTesting) testingFunction();
  else start();
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

function testingFunction(){
  isStart = true;
  isActive = true;

  document.getElementById("info").style.visibility = "visible";
  document.getElementById("deck-list").style.display = "inline-block";
  document.getElementById("inventory-list").style.display = "inline-block";

  p_name = "tester";
  document.getElementById("info-name").innerHTML = p_name;
  player = new Character("rogue");

  for(let i = 0; i < 3; i++){
    pushCard("Cycle", player);
  }

  addItemToInventory(allItems["Small Health Potion"]());
  addItemToInventory(allItems["Small Health Potion"]());
  addItemToInventory(allItems["Small Health Potion"]());
  addItemToInventory(allItems["Small Health Potion"]());
  addItemToInventory(allItems["Small Stamina Potion"]());
  addItemToInventory(allItems["Small Stamina Potion"]());
  addItemToInventory(allItems["Small Stamina Potion"]());
  addItemToInventory(allItems["Small Mana Potion"]());
  addItemToInventory(allItems["Small Mana Potion"]());
  addItemToInventory(allItems["Small Mana Potion"]());

  player.gold += 5000;

  initDeck();

  checkStats();

  startFloor(current_floor);
}

function initEnemies(){
  allEnemiesCategory["Level"] = levelTheme;
  allEnemiesCategory["Race"] = Race;

  allEnemies["Goblin Soldier"] = GoblinSoldier;
  allEnemies["Small Goblin"] = SmallGoblin;
  allEnemies["Large Goblin"] = LargeGoblin;
  allEnemies["Goblin Warchief"] = GoblinWarchief;

  function GoblinSoldier(){
    let dude = new Enemy(1, 15, randomNum(125, 5), 10, "Goblin Soldier", "Goblin", "normal", randomNum(35, 5), randomNum(2, 1), 0, 3, 0, [], ["A Goblin Solider catches you in it's gaze.", "You spot a Goblin Solider in the distance."], [], ["Goblin Soldier falls to the ground."]);
    pushCard("Heavy Attack", dude);
    pushCard("Attack", dude);
    pushCard("Attack", dude);
    return dude;
  }
  function SmallGoblin(){
    let dude = new Enemy(1, 8, randomNum(75, 5), 90, "Small Goblin", "Goblin", "normal", randomNum(25, 5), randomNum(2, 1), 0, 0, 0, [], ["You see a small pair of red eyes lurking forward.", "A Small Goblin dashes towards you.", "A Small Goblin stands in your way."], [], ["Small Goblin collapses."]);
    pushCard("Attack", dude);
    return dude;
  }
  function LargeGoblin(){
    let dude = new Enemy(1, 15, randomNum(125, 5), 10, "Large Goblin", "Goblin", "normal", randomNum(45, 5), randomNum(3, 1), 0, 0, 0, [], ["You see a large pair of red eyes lurking forward.", "A Large Goblin dashes towards you.", "A Large Goblin stands in your way."], [], ["Large Goblin can no longer move."]);
    pushCard("Heavy Attack", dude);
    pushCard("Attack", dude);
    return dude;
  }
  function GoblinWarchief(){
    let dude = new Enemy(1, 50, randomNum(500, 50), 100, "Goblin Warchief", "Goblin-Boss", "normal", randomNum(85, 5), randomNum(5, 1), 0, 5, 0, [], ["Goblin Warchief screeches out at your sight.", "You spot a Goblin Warchief eating a small goblin.", "The tattoos on the Goblin Warchief kinda look cool."], [], ["Goblin Warchief falls to the ground."]);
    pushCard("Heavy Attack", dude);
    pushCard("Heavy Attack", dude);
    pushCard("Heavy Attack", dude);
    pushCard("Attack", dude);
    return dude;
  }

  function Race(race, boss){
    let array = [];
    for(let key in allEnemies){
      let value = allEnemies[key]();
      if(value.race) if(value.race == race) array.push(value);
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

  function levelTheme(level){
    let array = [];
    for(let key in allEnemies){
      let value = allEnemies[key]();
      if(value.level) if(value.level == level) if(!value.race.includes("-Boss")) if(!array.includes(value.race)) array.push(value.race);
    }

    return array[Math.floor(Math.random() * array.length)];
  }
}

function initCards(){
  allCards["Attack"] = Attack;
  allCards["Do Nothing"] = DoNothing;
  allCards["Rest"] = Rest;
  allCards["Heavy Attack"] = HeavyAttack;
  allCards["Cycle"] = Cycle;
  allCards["Fireball"] = Fireball;

  function Attack(){
    let thing = new Card(1, undefined, undefined, "Attack", "normal", "Any", 5, 0, 0, 0, 0, 20, "A normal attack.", ["(you) takes a swing at (enemy).", "(you) swings at (enemy).", "(you) pokes (enemy).", "(you) smacks (enemy)."]);
    return thing;
  }
  function DoNothing(){
    let thing = new Card(1, undefined, undefined, "Do Nothing", "normal", "Any", 0, 0, 0, 0, 0, 0, "Do Nothing.", ["(you) does nothing.", "(you) durdles."]);
    return thing;
  }
  function Rest(){
    let thing = new Card(1, undefined, undefined, "Rest", "normal", "Any", 0, 0, 0, 0, 0, 0, "Recover health, stamina, and mana.", ["(you) rests for a second.", "(you) relaxes.", "(enemy) looks confused as (you) sleeps."]);
    thing.effect = function(){
      this.user.currentHealth += 10;
      if(this.user.currentHealth > this.user.totalHealth) this.user.currentHealth = this.user.totalHealth;
      this.user.currentStamina += 25;
      if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
      this.user.cuurentMana += 25;
      if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
    };
    return thing;
  }
  function HeavyAttack(){
    let thing = new Card(1, undefined, undefined, "Heavy Attack", "normal", "Warrior", 10, 0, 0, 0, 0, 30, "A strong attack.", ["(you) bashes in (enemy)'s head.", "(you) deals a crushing blow to (enemy)."]);
    return thing;
  }
  function Cycle(){
    let thing = new Card(1, undefined, undefined, "Cycle", "normal", "Rogue", 0, 0, 0, 0, 0, 0, "Cycle through all card slots.", ["(you) takes a moment to prepare.", "(you) shuffles around some equipment.", "(you) looks for (enemy)'s weakness."]);
    thing.effect = function(){
      for(let i = 0; i < this.user.slots; i++){
        setCardAt(i);
      }
    };
    return thing;
  }
  function Fireball(){
    let thing = new Card(1, undefined, undefined, "Fireball", "fire", "Mage", 0, 20, 0, 0, 50, 0, "A ball of fire.", ["(you) conjures a ball of fire.", "An explosion of fire hits (enemy)."]);
    return thing;
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
    let thing = new Item(1, 25, "Small Health Potion", 90, "Restores minor health");
    thing.effect = function(){
      player.currentHealth += 20;
      if(player.currentHealth > player.totalHealth) player.currentHealth = player.totalHealth;
    }
    return thing;
  }
  function SmallManaPotion(){
    let thing = new Item(1, 35, "Small Mana Potion", 100, "Restores minor mana");
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
      player.currentStamina += 20;
      if(player.currentStamina > player.totalStamina) player.currentStamina = player.totalStamina;
      player.currentStamina += 35;
      if(player.currentStamina > player.totalStamina) player.currentStamina = player.totalStamina;
      player.currentStamina += 35;
      if(player.currentStamina > player.totalStamina) player.currentStamina = player.totalStamina;
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

function pushCard(cardName, user){
  let thing = allCards[cardName]();
  thing.user = user;

  if(user != player){
    user.cards.push(thing);
  } else{
    deck.push(thing);
  }
}

function initiateBattle(race, boss){
  enemies = [];
  dead_enemies = [];

  if(boss){
    if(Math.floor(Math.random() * 2)) enemies.push(allEnemiesCategory["Race"](race, false));
    enemies.push(allEnemiesCategory["Race"]((race + "-Boss"), true));
    if(Math.floor(Math.random() * 2)) enemies.push(allEnemiesCategory["Race"](race, false));
  } else{
    let amount = Math.floor(Math.random() * 100);
    if(amount >= 0 && amount < 45){
      enemies.push(allEnemiesCategory["Race"](race, false));
    }
    if(amount >= 45 && amount < 90){
      enemies.push(allEnemiesCategory["Race"](race, false));
      enemies.push(allEnemiesCategory["Race"](race, false));
    }
    if(amount >= 90 && amount < 100){
      enemies.push(allEnemiesCategory["Race"](race, false));
      enemies.push(allEnemiesCategory["Race"](race, false));
      enemies.push(allEnemiesCategory["Race"](race, false));
    }
  }

  startBattle(enemies);
}

function FloorOne(){
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

            for(let i = 0; i < 3; i++){
              pushCard("Heavy Attack", player);
            }

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
            gen_step = 0;
            options = 0;
            isActive = false;

            document.getElementById("deck-list").style.display = "inline-block";
            document.getElementById("inventory-list").style.display = "inline-block";

            counter = 0;
            loop2();

            function loop2(){
              if(counter == 1000) addText("You look ahead and see two doors.");
              if(counter == 1900){
                addText("&nbsp");
                addText("One door has a sign - \"Tutorial\"; the other - \"Floor 1\".");
              }
              if(counter == 3000){
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

  let race = allEnemiesCategory["Level"](floor);

  counter = 0;

  loop();

  function loop(){
    if(counter == 800){
      // let path = Math.floor(Math.random() * 1000);
      let path = 350;

      if(path >= 0 && path < 100){
        counter = 0;
      }
      else if(path >= 100 && path < 250){
        initiateBattle(race, false);
      }
      else if(path >= 250 && path < 300){
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
      else if(path >= 300 && path < 375){
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
                        addText("<span style='color: purple'>(" + i + ")</span> x" + shopKeeperItems[temp_items[i]] + " " + temp_items[i] + ": " + allItems[temp_items[i]]().cost + " gold.");
                      }

                      addText("<span style='color: purple;'>(1)</span> Go Back");
                      addText("Remaining Gold: " + player.gold);

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
                        addText("&nbsp");
                        addText(chosenOne.name + " purchased for " + chosenOne.cost + " gold.");
                        shopKeeperItems[chosenOne.name] = shopKeeperItems[chosenOne.name] - 1;
                        if(shopKeeperItems[chosenOne.name] == 0){
                          delete shopKeeperItems[chosenOne.name];
                        }
                      } else{
                        addText("You don't have enough gold for that item.");
                      }

                      gen_step = 0;
                      itemsLoop();
                    }
                  }
                } else if(gen_step == 2){

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
      // //TODO: implement choices.
      // else if(path >= 400 && path < 500){
      //   gen_step = 0;
      //   let tem_counter = 0;
      //   choices();
      //
      //   function choices(){
      //     if(temp_counter == 0){
      //       addText("&nbsp");
      //
      //     } else if(){
      //
      //     }
      //
      //   }
      // }
      else if(path >= 375 && path < 1000){
        myriad();
        function myriad(){
          addText("&nbsp");
          let random = Math.floor(Math.random() * 10);
          if(random >= 0 || random < 5){
            let texts = [];
            texts.push("An omnious feeling creeps up your back.");
            texts.push("You feel a slight breeze blow past you.");
            texts.push("You feel eyes watching you from the shadows.");
            texts.push("Candles dimly illuminate your way.");
            texts.push("You hear droplets echo in the distance.");

            let randomo = Math.floor(Math.random() * texts.length);
            addText(texts[randomo]);
          } else if(random >= 5 || random < 8){
            let texts = [];
            texts.push("There is a barred window that you can barely make out whats outside.");
            texts.push("The small candles flicker, making the shadows dance.");
            texts.push("The damp air wraps around your body.");

            let randomo = Math.floor(Math.random() * texts.length);
            addText(texts[randomo]);
          } else if(random >=8 || random < 10){
            let texts = [];
            texts.push("You come across a stretched out hallway.");
            texts.push("The cold, stone walls do not feel inviting.");

            let randomo = Math.floor(Math.random() * texts.length);
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
    if(counter == 1200) addText("But then realize that the dev sucks and hasn't added this yet.");
    if(counter == 2200) addText("(sorry).");
    if(counter == 3000) addText("You wonder what that was all about and head to the first floor...");
    if(counter == 4000){
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
  isStart = true;
  FloorOne();
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
          document.getElementById("enemies").childNodes[j].childNodes[1].id = "enemy-health" + (j - 1);
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
    if(player.currentExp > player.totalExp){
      player.level = player.level + 1;
      player.currentExp = player.currentExp - player.totalExp;
      player.totalExp = player.totalExp + player.totalExp/2;
    }
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
  isActive = false;

  setTimeout(con, 1500);

  function con(){
    addText("<p style='color: purple'>(1) Continue</p>");
    isActive = true;
  }

  options = 1;

  loop();

  function loop(){
    if(paused){
      loop1();
      function loop1(){
        if(paused) setTimeout(loop1, 0);
        else loop();
      }
    } else{
      if(gen_step == 0){
        setTimeout(loop, 0);
      } else{
        if(result == "died" || result == "cards"){
          gameOver();
        } else{
          //Cleanup Step
          isActive = false;
          clearText();

          document.getElementById("board").style.backgroundColor = "rgb(255, 255, 255)";
          document.getElementById("characters").style.display = "none";
          document.getElementById("info-2").style.display = "block";

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
      }
    }
  }
}

function loot(level){
  return allItemsCategory["Drop"](level);
}

function addItemToInventory(item){
  inventory[item.name] = (inventory[item.name] || 0) + 1;
}

function buttonPress(event){
  //TODO: implement clicks.
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

function activateCard(cardNum, target){
  isActive = false;

  if(battleStep == 0){
    if((current_cards[cardNum].attack == 0 && current_cards[cardNum].magicA == 0) || enemies.length == 1){
      let eCard = enemies[0].cards[Math.floor(Math.random() * enemies[0].cards.length)];
      let pCard = current_cards[cardNum];

      addText("&nbsp");

      if(useCard(pCard, eCard, enemies[0])){
        setCardAt(cardNum);
      }
      for(let i = 0; i < enemies.length; i++){
        eCard = enemies[i].cards[Math.floor(Math.random() * enemies[i].cards.length)];
        useCard(eCard, pCard, player);
      }
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
    }
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
    this.job = "warrior";
    this.totalHealth = 125;
    this.totalAttack = 5;
    this.totalMagicA = 1;
    this.totalDefense = 5;
    this.totalMagicD = 1;
    this.totalMana = 50;
    this.totalStamina = 100;
    this.slots = 3;

  } else if(job == "rogue"){
    this.name = p_name;
    this.job = "rogue"
    this.totalHealth = 115;
    this.totalAttack = 3;
    this.totalMagicA = 3;
    this.totalDefense = 3;
    this.totalMagicD = 3;
    this.totalMana = 75;
    this.totalStamina = 75;
    this.slots = 4;
  } else if(job == "mage"){
    this.name = p_name;
    this.job = "mage";
    this.totalHealth = 100;
    this.totalAttack = 1;
    this.totalMagicA = 5;
    this.totalDefense = 1;
    this.totalMagicD = 5;
    this.totalMana = 100;
    this.totalStamina = 50;
    this.slots = 3;
  }

  this.level = 1;
  this.totalExp = 100;
  this.gold = 1000;
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

function Card(cardLevel, cardUser, cardTarget, cardName, cardType, cardJob, cardAttack, cardMagicA, cardDefense, cardMagicD, cardMana, cardStamina, cardDescription, cardSpeech){
  this.level = cardLevel;
  this.user = cardUser;
  this.target = cardTarget;
  this.name = cardName;
  this.type = cardType;
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

function Item(level, chance, name, cost, description){
  this.level = level;
  this.name = name;
  this.cost = cost;
  this.chance = chance;
  this.description = description;
  this.effect = function(){ };
}

function initDeck(){
  for(let i = 0; i < 10; i++){
    pushCard("Attack", player);
  }
  for(let i = 0; i < 5; i++){
    pushCard("Do Nothing", player);
  }

  for(let i = 0; i < 5; i++){
    pushCard("Rest", player);
  }
}

function addText(text){
  let newP = document.createElement("p");
  newP.innerHTML = text;
  document.getElementById("text").prepend(newP);
  for(let i = 0; i < document.getElementById("text").childElementCount; i++){
    let color = i * 18;
    document.getElementById("text").children.item(i).style.color = "rgb(" + color + "," + color + "," + color + ")"
  }
  if(document.getElementById("text").childElementCount > 11){
    for(let i = 0; i < document.getElementById("text").childElementCount - 11; i++){
      removeElement(document.getElementById("text").lastElementChild);
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
}

function randomNum(base, variance){
  let result;
  if(Math.floor(Math.random() * 2) == 0) result = base + Math.floor(Math.random() * (variance + 1));
  else result = base - Math.floor(Math.random() * (variance + 1));
  return result;
}

function updateDeckModal(){
  let deckNode = document.getElementById("deck-listing");
  while (deckNode.firstChild) {
      deckNode.removeChild(deckNode.firstChild);
  }

  let dict = {};
  for(let i = 0; i < deck.length; i++){
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

function gameOver(){
  console.log("Game Over");
  clearText();
  isBattle = false;
  isActive = false;
  isStart = false;
  location.reload(true);
}

//Set proportions for margin %
function proportions(total, current, target){
  let ratio = 1- (current/total);
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
