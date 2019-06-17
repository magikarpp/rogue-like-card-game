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
  document.getElementsByClassName("close")[0].onclick = function(){
    document.getElementById("deck-modal").style.display = "none";
  }

  window.onclick = function(event){
    if(event.target == document.getElementById("deck-modal")){
      document.getElementById("deck-modal").style.display = "none";
    }
  }

  start();
}

function temporaryBattle(){
  //FROM HERE DOWN IS TEMPORARY TESTING
  let tempEnemy = new Enemy(1, "Goblin", "normal", 10, 1, 1, ["A wild Goblin appears!", "A Goblin stares at you with hungry eyes.", "You see a pair of glowing, red eyes coming at you from the shadows!"], [], ["(you) weakly wobbles.", "(you) cries in pain."]);
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
  let tempEnemy2 = new Enemy(1, "Goblin", "normal", 10, 1, 1, ["A wild Goblin appears!", "A Goblin stares at you with hungry eyes.", "You see a pair of glowing, red eyes coming at you from the shadows!"], [], ["(you) weakly wobbles.", "(you) cries in pain."]);
  tempEnemy2.cards = tempCards;
  enemies.push(tempEnemy2);

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
      if(counter == 2300) addText("Your eyes adjust to the dark, dreary chamber.");
      if(counter == 2900) addText("Rats scurry behind spider webs as you lift yourself up.");
      if(counter == 3700) addText("In front of you lies three weapons.");
      if(counter == 4400) {
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
            gen_step = 0;
            options = 0;
            isActive = false;

            document.getElementById("deck-list").style.display = "inline-block";

            counter = 0;
            loop2();

            function loop2(){
              if(counter == 1000){
                addText("&nbsp");
                addText("You look ahead and see two doors.");
              }
              if(counter == 1900) addText("One door has a sign - \"Tutorial\"; the other - \"Floor 1\".");
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
      let temp = false
      for(let i = enemies.length - 1; i >= 0; i--){
        if(enemies[i].currentHealth <= 0){
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
    if(current_cards[cardNum].attack == 0 || enemies.length == 1){
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
    let damage = (uCard.attack + Math.floor(Math.random() * uCard.user.currentAttack) - (tCard.defense + target.currentDefense));
    if(uCard.attack == 0 || damage < 0) damage = 0;
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

function Character(job){
  let tempCard;

  if(job == "warrior"){
    this.name = p_name;
    this.job = "warrior";
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
      deck.push(new Card(this, "Heavy Attack", "normal", 10, 0, 0, 25, "A strong attack.", ["(you) bash in (enemy)'s head.", "(you) deal a crushing blow to (enemy)."]));
    }

  } else if(job == "rogue"){
    this.name = p_name;
    this.job = "rogue"
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
  } else if(job == "mage"){
    this.name = p_name;
    this.job = "mage";
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
    deck.push(new Card(player, "Attack", "normal", 5, 0, 0, 15, "A normal attack.", ["(you) takes a swing at (enemy).", "(you) swings at (enemy).", "(you) pokes (enemy).", "(you) smacks (enemy)."]));
  }
  for(let i = 0; i < 5; i++){
    let tempCard = new Card(player, "Nothing", "normal", 0, 0, 0, 0, "Do nothing.", ["(you) takes a seat.", "(you) sits there quietly."]);
    deck.push(tempCard);
  }

  for(let i = 0; i < 5; i++){
    let tempCard = new Card(player, "Rest", "normal", 0, 0, 0, 0, "Recover health, stamina, and mana.", ["(you) rests for a second.", "(you) relaxes.", "(enemy) looks confused as (you) sleeps."]);
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
