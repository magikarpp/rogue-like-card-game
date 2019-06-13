let isStart = false;
let isBattle = false;
let isActive = false;
let battleStep = 0;

let pressingDown = false;

let player;
let deck = [];
let tempDeck = [];
let current_cards = [];
let enemies = [];

document.addEventListener("keydown", buttonPress);
document.addEventListener("keyup", buttonRelease);

document.getElementById("warrior").addEventListener("click", start);
document.getElementById("rogue").addEventListener("click", start);
document.getElementById("mage").addEventListener("click", start);

initialize();

function start(){
  document.getElementById("game").style.display = "block";
  document.getElementById("start-screen").style.display = "none";
  isStart = true;
  player = new Character(this.id);

  //Player Specific Cards
  if(player.name == "Warrior"){
    for(let i = 0; i < 3; i++){
      deck.push(new Card(player, "Heavy Attack", "normal", 10, 0, 0, 25, "A strong attack.", ["(you) bash in (enemy)'s head.", "(you) deal a crushing blow to (enemy)."]));
    }
  }

  initDeck();

  //FROM HERE DOWN IS TEMPORARY TESTING
  let tempEnemy = new Enemy(1, "Goblin", "normal", 50, 1, 1, ["A wild Goblin appears!", "A Goblin stares at you with hungry eyes.", "You see a pair of glowing, red eyes coming at you from the shadows!"], [], ["(you) weakly wobbles.", "(you) cries in pain."]);
  let tempCard = new Card(tempEnemy, "Rest", "normal", 0, 0, 0, 0, "Recover stamina and mana.", ["(you) rests it's eyes.", "(you) feels well rested.", "(enemy) looks confused as (you) sleeps."]);
  tempCard.effect = function(){
    this.user.currentHealth += 5;
    if(this.user.currentHealth > this.user.totalHealth) this.user.currentHealth = this.user.totalHealth;
    this.user.currentStamina += 10;
    if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
    this.user.cuurentMana += 5;
    if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
  };

  let tempCards = [];
  tempCards.push(tempCard);

  tempCard = new Card(tempEnemy, "Attack", "normal", 15, 0, 0, 0, "A normal attack.", ["(you) swings at (enemy).", "(you) pokes (enemy).", "(you) smacks (enemy)."]);
  for(let i = 0; i < 5; i++){
    tempCards.push(tempCard);
  }

  tempEnemy.cards = tempCards;
  enemies.push(tempEnemy);

  startBattle(enemies);
}

function startBattle(enemies){
  isBattle = true;
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
    addText(enemies[i].encounter());
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
      for(let i = enemies.length - 1; i >= 0; i--){
        if(enemies[i].currentHealth <= 0) enemies.splice(i, 1);
      }
      setTimeout(loop, 0);
    }
  }
}

function endBattle(result){
  isBattle = false;
  gameOver();
}

function buttonPress(event){
  //TODO: implement clicks.
  if(pressingDown == false){
    if(isActive){
      pressingDown = true;
      if(isBattle){
        if(battleStep == 0){
          let size = current_cards.length;
          if(event.key > 0 && event.key < size + 1){
            // document.getElementById("c" + (event.key - 1)).style.border = "1px solid purple";
            activateCard(event.key - 1);
          }
        }
        else if(battleStep == 1){

        }
      }
    }
  }
}

function buttonRelease(event){
  pressingDown = false;
}

function activateCard(cardNum){
  isActive = false;

  if(enemies.length == 1){
    let eCard = enemies[0].cards[Math.floor(Math.random() * enemies[0].cards.length)];
    let pCard = current_cards[cardNum];

    if(useCard(pCard, eCard, enemies[0])){
      setCardAt(cardNum);
    }
    useCard(eCard, pCard, player);

  } else{

  }

  // document.getElementById("c" + cardNum).style.border = "";
  isActive = true;
}

function useCard(uCard, tCard, target){
  if(uCard.user.currentStamina < uCard.stamina){
    addText(uCard.user.name + " does not have enough stamina.");
    return false;
  } else if(uCard.user.currentMana < uCard.mana){
    addText(uCard.user.name + " does not have enough mana.");
    return false;
  } else {
    uCard.user.currentStamina -= uCard.stamina;
    uCard.user.currentMana -= uCard.mana;

    uCard.effect();
    console.log("uCard.attack = " + uCard.attack);
    console.log("ucard.user.currentAttack = " + uCard.user.currentAttack);
    console.log("tCard.defense = " + tCard.defense);
    console.log("target.currentDefense = " + target.currentDefense);
    console.log("(uCard.attack + uCard.user.currentAttack) - (tCard.defense + target.currentDefense)");
    let damage = (uCard.attack + uCard.user.currentAttack) - (tCard.defense + target.currentDefense);
    if(uCard.attack == 0 || damage < 0) damage = 0;
    console.log(uCard.user.name + " uses " + uCard.name + " to hit " + target.name + " who has " + target.currentHealth + " health for " + damage + " damage.");
    let text = uCard.speech().replace(/\(you\)/g, uCard.user.name).replace(/\(enemy\)/, target.name).replace(/\(damage\)/, damage);
    addText(text);
    target.currentHealth -= damage;
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

function initialize(){
  document.getElementById("game").style.display = "none";
}

function Character(name){
  let tempCard;

  if(name == "warrior"){
    this.name = "Warrior";
    this.totalHealth = 150;
    this.currentHealth = this.totalHealth;
    this.totalAttack = 5;
    this.currentAttack = this.totalAttack;
    this.totalDefense = 5;
    this.currentDefense = this.totalDefense;
    this.totalMana = 50;
    this.currentMana = this.totalMana;
    this.totalStamina = 100;
    this.currentStamina = this.totalStamina;
    this.slots = 3;
    this.status = [];

  } else if(name == "rogue"){
    this.name = "Rogue";
    this.totalHealth = 100;
    this.currentHealth = this.totalHealth;
    this.totalAttack = 3;
    this.currentAttack = this.totalAttack;
    this.totalDefense = 2;
    this.currentDefense = this.totalDefense;
    this.totalMana = 65;
    this.currentMana = this.totalMana;
    this.totalStamina = 75;
    this.currentStamina = this.totalStamina;
    this.slots = 4;
    this.status = [];
  } else if(name == "mage"){
    this.name = "Mage";
    this.totalHealth = 75;
    this.currentHealth = this.totalHealth;
    this.totalAttack = 1;
    this.currentAttack = this.totalAttack;
    this.totalDefense = 1;
    this.currentDefense = this.totalDefense;
    this.totalMana = 100;
    this.currentMana = this.totalMana;
    this.totalStamina = 50;
    this.currentStamina = this.totalStamina;
    this.slots = 3;
    this.status = [];
  }
}

function Enemy(eLevel, eName, eType, eHealth, eAttack, eDefense, eEncounter, eCards, elowHealth){
  this.level = eLevel;
  this.name = eName;
  this.type = eType;
  this.totalHealth = eHealth * this.level;
  this.currentHealth = this.totalHealth;
  this.totalAttack = eAttack * this.level;
  this.currentAttack = this.totalAttack;
  this.totalDefense = eDefense * this.level;
  this.currentDefense = this.totalDefense;
  this.encounters = eEncounter;
  this.cards = eCards;
  this.damagedWords = elowHealth;
  this.lowHealth = function(){ };
  this.encounter = function(){
    return this.encounters[Math.floor(Math.random() * this.encounters.length)];
  };
}

function Card(cardUser, cardName, cardType, cardAttack, cardDefense, cardMana, cardStamina, cardDescription, cardSpeech){
  this.user = cardUser;
  this.name = cardName;
  this.type = cardType;
  this.attack = cardAttack;
  this.defense = cardDefense;
  this.mana = cardMana;
  this.stamina = cardStamina;
  this.speeches = cardSpeech;
  this.effect = function(){ };
  this.speech = function(){
    return this.speeches[Math.floor(Math.random() * this.speeches.length)];
  };
  this.description = cardDescription;
}

function initDeck(){
  for(let i = 0; i < 9; i++){
    deck.push(new Card(player, "Attack", "normal", 5, 0, 0, 15, "A normal attack.", ["(you) swings at (enemy).", "(you) pokes (enemy).", "(you) smacks (enemy)."]));
  }
  for(let i = 0; i < 5; i++){
    let tempCard = new Card(player, "Defense", "normal", 0, 3, 0, 10, "A normal defense. Recover slight stamina and mana.", ["(you) takes a defensive stance."]);
    tempCard.effect = function(){
      this.user.currentStamina += 25;
      if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
      this.user.cuurentMana += 10;
      if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
    };
    deck.push(tempCard);
  }

  for(let i = 0; i < 5; i++){
    let tempCard = new Card(player, "Rest", "normal", 0, 0, 0, 0, "Recover health, stamina, and mana.", ["(you)'s eyes close for just a second.", "(you) feels well rested.", "(enemy) looks confused as (you) sleeps."]);
    tempCard.effect = function(){
      this.user.currentHealth += 10;
      if(this.user.currentHealth > this.user.totalHealth) this.user.currentHealth = this.user.totalHealth;
      this.user.currentStamina += 50;
      if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
      this.user.cuurentMana += 25;
      if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
    };
    deck.push(tempCard);
  }
}

function gameOver(){
  console.log("Game Over");
  isBattle = false;
  isActive = false;
  isStart = false;
}

function addText(text){
  let newP = document.createElement("p");
  newP.innerHTML = text;
  document.getElementById("info").prepend(newP);
  for(let i = 0; i < document.getElementById("info").childElementCount; i++){
    let color = i * 31;
    document.getElementById("info").children.item(i).style.color = "rgb(" + color + "," + color + "," + color + ")"
  }
  if(document.getElementById("info").childElementCount > 12){
    for(let i = 0; i < document.getElementById("info").childElementCount - 12; i++){
      removeElement(document.getElementById("info").lastElementChild);
    }
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
