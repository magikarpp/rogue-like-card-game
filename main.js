let isStart = false;
let isBattle = false;
let active = false;

let player;
let deck = [];
let tempDeck = [];
let current_cards = [];
let enemies = [];

document.getElementById("warrior").addEventListener("click", start);
document.getElementById("rogue").addEventListener("click", start);
document.getElementById("mage").addEventListener("click", start);

initialize();

function start(){
  document.getElementById("game").style.display = "block";
  document.getElementById("start-screen").style.display = "none";
  isStart = true;

  player = new Character(this.id);
  initDeck();

  //FROM HERE DOWN IS TEMPORARY TESTING
  let tempEnemy = new Enemy(1, "Goblin", "normal", 50, 1, 1, ["A wild Goblin appears!", "A Goblin stares at you with hungry eyes.", "You see a pair of glowing, red eyes coming at you from the shadows!"], []);
  let tempCard = new Card(tempEnemy, "Rest", "normal", 0, 0, 0, 0, "Recover stamina and mana.", ["($you)'s eyes close for just a second.", "($you) feels well rested.", "($enemy) looks confused as ($you) sleeps."]);
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

  tempCard = new Card("Attack", "normal", 5, 0, 0, 15, "A normal attack.", ["($you) swings at ($enemy) for ($damage).", "($you) pokes ($enemy) for ($damage).", "($you) smacks ($enemy) for ($damage)."]);
  tempCards.push(tempCard);
  tempCards.push(tempCard);

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
    tempHealth.id = "enemy-health";
    document.getElementById("enemy" + i).appendChild(tempHealth);
  }

  //Set player on board
  document.getElementById("player-name").innerHTML = player.name;
  document.getElementById("player-health").style.marginLeft = proportions(player.totalHealth, player.currentHealth, 35) + "%";

  //Set current deck to tempDeck for battle.
  for(let i = 0; i < deck.length; i++){
    tempDeck.push(deck[i]);
  }

  shuffle(tempDeck);
  setSlots();
}

//Set proportions for margin %
function proportions(total, current, target){

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
  let nextCard = tempDeck.pop();
  document.getElementById("deck-current").innerHTML = tempDeck.length;
  if(nextCard == null || nextCard == undefined){
    gameOver();
    return;
  }
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
    for(let i = 0; i < 3; i++){
      deck.push(new Card(player, "Heavy Attack", "normal", 10, 1, 0, 25, "A strong attack.", ["($you) bash in ($enemy)'s head.", "($you) deal a crushing blow to ($enemy)."]));
    }

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

function Enemy(eLevel, eName, eType, eHealth, eAttack, eDefense, eEncounter, eCards){
  this.level = eLevel;
  this.name = eName;
  this.type = eType;
  this.totalHealth = eHealth * this.level;
  this.currentHealth = this.totalHealth;
  this.totalAttack = eAttack * this.level;
  this.currentAttack - this.totalAttack;
  this.totalDefense = eDefense * this.level;
  this.currentDefense = this.totalDefense;
  this.encounters = eEncounter;
  this.cards = eCards;
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

function initDeck(){
  for(let i = 0; i < 9; i++){
    deck.push(new Card(player, "Attack", "normal", 5, 0, 0, 15, "A normal attack.", ["($you) swings at ($enemy) for ($damage).", "($you) pokes ($enemy) for ($damage).", "($you) smacks ($enemy) for ($damage)."]));
  }
  for(let i = 0; i < 5; i++){
    let tempCard = new Card(player, "Defense", "normal", 0, 3, 0, 10, "A normal defense. Recover slight stamina and mana.", ["($you) takes a defensive stance."]);
    tempCard.effect = function(){
      this.user.currentStamina += 25;
      if(this.user.currentStamina > this.user.totalStamina) this.user.currentStamina = this.user.totalStamina;
      this.user.cuurentMana += 10;
      if(this.user.currentMana > this.user.totalMana) this.user.currentMana = this.user.totalMana;
    };
    deck.push(tempCard);
  }

  for(let i = 0; i < 5; i++){
    let tempCard = new Card(player, "Rest", "normal", 0, 0, 0, 0, "Recover health, stamina, and mana.", ["($you)'s eyes close for just a second.", "($you) feels well rested.", "($enemy) looks confused as ($you) sleeps."]);
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

}

function removeElement(elementId){
  var element = document.getElementById(elementId);
  element.parentNode.removeChild(element);
}
