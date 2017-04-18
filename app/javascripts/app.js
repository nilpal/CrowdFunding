// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import cf_artifacts from '../../build/contracts/CrowdFunding.json'

// CrowdFunding is our usable abstraction, which we'll use through the code below.
var CrowdFunding = contract(cf_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the CrowdFunding abstraction for Use.
    CrowdFunding.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("Error fetching  accounts." + err.message);
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts.");
        return;
      }

      accounts = accs;

      document.getElementById("ownerAcct").innerHTML = accounts[0];
      
      var receiverSelect = document.getElementById("receiver");
      var fundingAccountSelect = document.getElementById("fundingAccount");
      for(var i = 1; i < 10; i++) {
        var acct = accounts[i];
        var acctOpt = document.createElement("option");
        acctOpt.value = acct;
        acctOpt.innerHTML = acct;
        acctOpt.title = "Balance: " + web3.eth.getBalance(acct).toNumber();
        fundingAccountSelect.appendChild(acctOpt);

        var receiverOpt = document.createElement("option");
        receiverOpt.value = acct;
        receiverOpt.innerHTML = acct;
        receiverSelect.appendChild(receiverOpt);
      }
      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {      
      var cf;
      var fProg = document.getElementById("fundProgress");
      CrowdFunding.deployed().then(function(instance) {
        cf = instance;
      }).then(function() {
        return cf.fundGoal.call();
      }).then(function(goal){
        var fundValue = web3.eth.getBalance(cf.address).toNumber();
        document.getElementById("balance").innerHTML = fundValue;
        fProg.max = goal.toNumber() / 1000000000000000000;
        fProg.value = fundValue;
        fProg.title = "Met " + fundValue + "/" + fProg.max;
      }).catch(function(e) {
        console.log(e);
        self.setStatus("Error getting balance; see log.");
      });  
  },

  fundProject: function() {
    var self = this;
    var currentAcct = document.getElementById("acctinfo");
    var amount = parseInt(document.getElementById("amount").value);
    this.setStatus("Initiating transaction... (please wait)");
    var account = document.getElementById("fundingAccount").value;
    var cf;
    CrowdFunding.deployed().then(function(instance) {
      cf = instance;
      console.log(account + ", " + amount);      
      cf.fundProject({ from: account, value: amount });
    }).then(function() {
      self.setStatus("Fund Transfer complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending funds; see log.");
    });
  },

    refundMoney: function() {
    var self = this;
    var receiverAddress = document.getElementById("receiver").value;
    var cf;
    CrowdFunding.deployed().then(function(instance) {
      cf = instance;
      cf.refundMoney(receiverAddress, {from: accounts[0]});
    }).then(function() {
      self.setStatus("Refund Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 CrowdFunding, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
