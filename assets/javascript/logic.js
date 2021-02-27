// Firebase
var firebaseConfig = {
    apiKey: "AIzaSyAItQs2KtkI5j3pM3FN8yxN_ZnFLyifruI",
    authDomain: "service-storage-acc7a.firebaseapp.com",
    databaseURL: "https://service-storage-acc7a-default-rtdb.firebaseio.com",
    projectId: "service-storage-acc7a",
    storageBucket: "service-storage-acc7a.appspot.com",
    messagingSenderId: "10223659033",
    appId: "1:10223659033:web:6b998588ce24ad03796288"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Create a variable to reference the database
  let db = firebase.database()
  //add a notification that the player connected
  
  //connections to store player info and messages and notifications
  // let playerInfoRef = db.ref("/players")
  let messageListRef = db.ref("/messages")
  
  //set up connection monitor and read connections
  let connectionsListRef = db.ref("/connections");
    // '.info/connected' is a special location provided by Firebase that is updated every time
    // the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    let connectedPlayers= db.ref(".info/connected");
  //create variables to store user names, choices, user wins and losses
  let myPlayerId = ""
  let intConnections = 0

  let otherPlayerChoice, myChoice = ""
  let otherPlayerWins, otherPlayerLosses, myWins, myLosses = 0
  let myTurn = false


//on buttons push
$("#btnStart").on("click", function(event) {
    if ($("#nameInput") !== "") {
      myName = $("#nameInput").val()
      $("#userInfoDiv").empty()
      let playerInfo = $("<h2>").text("Welcome " + myName +"! You Are Player " + myPlayerId.slice(6,7))
      let playerTurnInfo = $("<h3 id='whoseTurn'>")
      $("#userInfoDiv").append(playerInfo, playerTurnInfo)
      //push player sign on message
      pushMessage(myName, "signed on")
      // console.log(myPlayerId, intConnections)
      if (myPlayerId === "player1") {
        // $("#player1Name").text(myName)    do this in the value event
        updateCurrentPlayerInfo("",0 , 0)
      }
      else if (myPlayerId === "player2") {
        // $("#player2Name").text(myName)     do this in the value event
        updateCurrentPlayerInfo("",0 , 0)
        startGame()
      }
    }
  })

db.ref("player1").on("value", function(snap) {
  console.log("player1 value event")
  console.log(snap.val().playerName)
  if (myPlayerId === "player1") {
    myChoice = snap.val().playerChoice;
    myWins = snap.val().playerWins
    myLosses = snap.val().playerLosses
    
    //update display
    $("#player1Name").text(snap.val().playerName)
    $("#player1WinsLosses").text("wins: " + myWins + "    Losses: " + myLosses)
  }

  if (myPlayerId === "player2") {
    otherPlayerChoice = snap.val().playerChoice;
    otherPlayerWins = snap.val().playerWins
    otherPlayerLosses = snap.val().playerLosses
    
    //update display
    $("#player1Name").text(snap.val().playerName)
    $("#player1WinsLosses").text("wins: " + otherPlayerWins + "    Losses: " + otherPlayerLosses)
  }

  //if both choices have been made then see who won
  if ((myChoice !== "") && (otherPlayerChoice !== "")) {
    console.log("both players have chosen")
  };
});

db.ref("player2").on("value", function(snap) {
  console.log("player2 value event")
  console.log(snap.val().playerName)
  if (myPlayerId === "player1") {
    otherPlayerChoice = snap.val().playerChoice;
    otherPlayerWins = snap.val().playerWins
    otherPlayerLosses = snap.val().playerLosses
    
    //update display
    $("#player2Name").text(snap.val().playerName)
    $("#player2WinsLosses").text("wins: " + otherPlayerWins + "    Losses: " + otherPlayerLosses)
  }

  if (myPlayerId === "player2") {
    myChoice = snap.val().playerChoice;
    myWins = snap.val().playerWins
    myLosses = snap.val().playerLosses
    
    //update display
    $("#player2Name").text(snap.val().playerName)
    $("#player2WinsLosses").text("wins: " + myWins + "    Losses: " + myLosses)
  }

  if ((myChoice !== "") && (otherPlayerChoice !== "")) {
    console.log("both players have chosen")
  };
})

function updateCurrentPlayerInfo(choice, wins, losses) {
  db.ref("/" + myPlayerId).set({
    player: myPlayerId,
    playerName: myName,
    playerChoice: choice,
    playerWins: wins,
    playerLosses: losses
  });

}

  $("#btnSend").on("click", function() {
    if (($("#messageInput") !== "") && (myName !== "")) {
      let messageToSend = $("#messageInput").val()
      //push player's  message
      pushMessage(myName, messageToSend)
      $("#messageInput").val("")
    }
  });

  $(".choice-button").on("click", function(event) {
    let btnId = $(this).attr("id");
    let btnNum = btnId.slice(0,1)
    let btnChoice = btnId.slice(1,100)
    console.log(myPlayerId, myChoice, btnNum)
    
    if ((myPlayerId === "player1") && (myChoice == "") && (btnNum === "1")) {
      console.log("my choice added1")
      updateCurrentPlayerInfo(btnChoice,myWins,myLosses)
    }
    
    if ((myPlayerId === "player2") && (myChoice == "") && (btnNum === "2")) {
      console.log("my choice added2")
      updateCurrentPlayerInfo(btnChoice,myWins,myLosses)
    }

  })
  
// When the client's connection state changes...
connectedPlayers.on("value", function(snap) {
  // If they are connected..
  if (snap.val()) {
    // Add user to the connections list.
    var con = connectionsListRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
    //add a notification that the player disconnected
  }
});

connectionsListRef.on("value", function(snap) {
  //update the number of connections
  intConnections = snap.numChildren()
  console.log("connections: " + intConnections)
  //If this instance is first connection, it is player1, if second connection, player2. otherwise too many people
  
      if (intConnections === 1) {
        myPlayerId = "player1"
        //update you are player
        //disable other player buttons
      }
      else if (intConnections === 2) {
        myPlayerId = "player2"
      }
      else {
        alert("Too many players, you just get to watch")
      }
    
});


function pushMessage(player, messageToPost) {
  messageListRef.push({
    playerName: myName,
    message: messageToPost,
    messageTime: firebase.database.ServerValue.TIMESTAMP
  });
}

messageListRef.on("child_added", function(snapshot) {
  // console.log(snapshot.val());
  // console.log(snapshot.val().playerName);
  // console.log(snapshot.val().message);
  let dateVal = snapshot.val().messageTime
  let msgTimeStamp = moment(dateVal).format("MM/DD/YYYY hh:mm:ss")
  // console.log(msgTimeStamp);
  let msgPlayerName = snapshot.val().playerName
  let msgMessage = snapshot.val().message;

  $("#messagesBox").prepend(msgPlayerName + ": " + msgMessage + "   " + msgTimeStamp + "\n")
  

  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});


function startGame() {
$(".choice-button").attr("style","visibility: visible;")
$(".wins-losses").attr("style","visibility: visible;")
}


// update fields accordingly as users log on and off
//function to write to player choice
//function to write to connection
//function to clear player choice
// function to write to wins
//function write to messages and logs

//create click events to watch for user choices

//write and read user choices

//create logic for rps game, function with two inputs, differentiating user