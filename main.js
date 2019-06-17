let isStart = false;
let isBattle = false;
let isActive = false;
let battleStep = 0;

let current_floor = 1;
let counter = 0;
let gen_step = 0;
let options = 0;

let player;
let p_name = "";
let deck = [];
let tempDeck = [];
let current_cards = [];
let active_card;
let enemies = [];

let allEnemies = {};
let allCards = {};

initialize();

function initialize(){
  document.addEventListener("keyup", buttonPress);

  document.getElementById("characters").style.display = "none";
  document.getElementById("cards").style.display = "none";
  document.getElementById("info").style.visibility = "hidden";
  document.getElementById("deck-list").style.display = "none";

  document.getElementById("deck-list").onclick = function(){
    updateDeckModal();
    document.getElementById("deck-modal").style.display = "block";
  }
  document.getElementById("close").onclick = function(){
    document.getElementById("deck-modal").style.display = "none";
  }

  window.onclick = function(event){
    if(event.target == document.getElementById("deck-modal")){
      document.getElementById("deck-modal").style.display = "none";
    }
  }

  initCards();
  initEnemies();

  start();
}

function initEnemies(){
  allEnemies["Goblin Soldier"] = GoblinSoldier;

  function GoblinSoldier(){
    let dude = new Enemy(1, randomNum(15, 1), "Goblin Soldier", "normal", randomNum(50, 5), randomNum(5, 1), 0, 1, 0, [], ["A Goblin Solider catches you in it's gaze.", "A small goblin dashes towards you.", "You spot a Goblin Solider in the distance."], [], ["Goblin Soldier falls to the ground."]);
    pushCard("Attack", dude);
    return dude;
  }

  function randomNum(base, variance){
    let result;
    if(Math.floor(Math.random() * 2) == 0) result = base + Math.floor(Math.random() * (variance + 1));
    else result = base - Math.floor(Math.random() * (variance + 1));
    return result;
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

function initCards(){
  allCards["Attack"] = Attack;
  allCards["Do Nothing"] = DoNothing;
  allCards["Rest"] = Rest;
  allCards["Heavy Attack"] = HeavyAttack;

  function Attack(){
    let thing = new Card(1, undefined, "Attack", "normal", "Any", 5, 0, 0, 0, 0, 20, "A normal attack.", ["(you) takes a swing at (enemy).", "(you) swings at (enemy).", "(you) pokes (enemy).", "(you) smacks (enemy)."]);
    return thing;
  }

  function DoNothing(){
    let thing = new Card(1, undefined, "Do Nothing", "normal", "Any", 0, 0, 0, 0, 0, 0, "Do Nothing.", ["(you) does nothing.", "(you) durdles."]);
    return thing;
  }

  function Rest(){
    let thing = new Card(1, undefined, "Rest", "normal", "Any", 0, 0, 0, 0, 0, 0, "Recover health, stamina, and mana.", ["(you) rests for a second.", "(you) relaxes.", "(enemy) looks confused as (you) sleeps."]);
    thing.effect = function(){
      this.user.currentHealth += 10;
      if(this.user.currentHealth > this.user.totalHealth) this.user.currentHealth = this.user.totalHealth;
      this.user.currentStamina += 50;
      if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
      this.user.cuurentMana += 25;
      if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
    };
    return thing;
  }

  function HeavyAttack(){
    let thing = new Card(1, player, "Heavy Attack", "normal", "Warrior", 10, 0, 0, 0, 0, 25, "A strong attack.", ["(you) bash in (enemy)'s head.", "(you) deal a crushing blow to (enemy)."]);
    return thing;
  }
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
  let newNode = document.createElement("p");
  newNode.innerHTML = "Total Cards: " + total;
  deckNode.appendChild(newNode);
}

function temporaryBattle(){
  enemies.push(allEnemies["Goblin Soldier"]());
  enemies.push(allEnemies["Goblin Soldier"]());

  startBattle(enemies);
}

function FloorOne(){
  document.getElementById("current-floor").innerHTML = "Floor " + 1;

  setName();
  loop();

  function loop(){
    if(gen_step == 2){
      nextSeq();
      return;
    }

    setTimeout(loop, 0);
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
              if(gen_step == 0){
                counter++;
                setTimeout(loop2, 0);
              } else{
                isActive = false;
                options = 0;
                if(gen_step == 1){
                  console.log("Tutorial");
                } else{
                  temporaryBattle();
                }
              }
            }
          } else setTimeout(loop1, 0);
        }
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
  document.getElementById("info").style.visibility = "hidden";

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
          addText("&nbsp");
          addText(enemies[i].deathSpeech());
          removeElement(document.getElementById("enemy" + i));
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
      setTimeout(loop, 0);
    }
  }
}

function endBattle(result){
  //Cleanup Step
  isBattle = false;
  isActive = false;

  document.getElementById("characters").style.display = "none";
  document.getElementById("cards").style.display = "none";
  document.getElementById("info").style.visibility = "visible";

  enemies = [];
  tempDeck = [];
  current_cards = [];

  for(let i = 0; i < player.slots; i++){
    removeElement(document.getElementById("c" + i));
  }

  gameOver();
}

function buttonPress(event){
  //TODO: implement clicks.
  if(isActive){
    if(isBattle){
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
    if(!isBattle){
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
      useCard(eCard, pCard, player);
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
        if(battleStep == 1) setTimeout(loop, 0);
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

function Enemy(eLevel, eExp, eName, eType, eHealth, eAttack, eMagicA, eDefense, eMagicD, eCards, eEncounter, elowHealth, eDeath){
  this.level = eLevel;
  this.exp = eExp;
  this.name = eName;
  this.type = eType;
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

function Card(cardLevel, cardUser, cardName, cardType, cardJob, cardAttack, cardMagicA, cardDefense, cardMagicD, cardMana, cardStamina, cardDescription, cardSpeech){
  this.level = cardLevel;
  this.user = cardUser;
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
}

function gameOver(){
  console.log("Game Over");
  clearText();
  isBattle = false;
  isActive = false;
  isStart = false;
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
