var CrowdFunding = artifacts.require("./CrowdFunding.sol");

contract('CrowdFunding', function(accounts) {
	console.log(accounts);
	var owner_account = accounts[0];
  var sender_account = accounts[1];


  it("Should allow funding the project", function(done) {

  	CrowdFunding.new({ from: accounts[0] }).then(
  		function(crowdfunding) {

        var goalProgressInit = web3.eth.getBalance(crowdfunding.address).toNumber();  
        console.log("\t** Goal Progress: " + goalProgressInit);
        var contribAmount = web3.toWei(0.000000005, 'ether');
  			crowdfunding.fundProject({ from: accounts[1], value: contribAmount }).then(
          function() {
  					var goalProgress = web3.eth.getBalance(crowdfunding.address).toNumber();
            var difference = goalProgress - goalProgressInit;
  					assert.equal(difference, contribAmount, "Contrib amount should match difference");
  					return goalProgress; 
  			}).then(
  				function(amount) {
  					console.log("\t** Goal Progress: " + amount);
            done();  					                   
  			}).catch(done);
  	}).catch(done);
  });

  it("Should allow refund by owner", function(done) {
    
    CrowdFunding.new({ from: accounts[0] }).then(
      function(crowdfunding) {

        var contribAmount = web3.toWei(0.002, 'ether');
        var initialBalance = web3.eth.getBalance(crowdfunding.address).toNumber(); 
        var donorBalance = web3.eth.getBalance(accounts[2]).toNumber(); 
        console.log("\t** Donor Balance: " + donorBalance);
        crowdfunding.fundProject({ from: accounts[2], value: contribAmount }).then(
          function() {
            var newBalance = web3.eth.getBalance(crowdfunding.address).toNumber();
            var newDonorBalance = web3.eth.getBalance(accounts[2]).toNumber();
            console.log("\t** Goal Progress: " + newBalance);
            console.log("\t** Donor Balance: " + newDonorBalance);
            var difference = newBalance - initialBalance;
            assert.equal(difference, contribAmount, "Difference should be what was sent");

            // Now try to issue refund as second user - should fail
            return crowdfunding.refundMoney(accounts[2], {from: accounts[2]});
        }).then(
          function() {  
            var balance = web3.eth.getBalance(crowdfunding.address);
            assert.equal(balance, contribAmount, "Balance should be unchanged");
            // Now try to issue refund as owner
            return crowdfunding.refundMoney(accounts[2], {from: accounts[0]});
        }).then(
          function() {
            var postRefundBalance = web3.eth.getBalance(crowdfunding.address).toNumber();
            var newNewDonorBalance = web3.eth.getBalance(accounts[2]).toNumber();
            console.log("\t** Goal Progress post refund: " + postRefundBalance);
            console.log("\t** Donor Balance: " + newNewDonorBalance);
            assert.equal(postRefundBalance, initialBalance, "Balance should be initial balance");
            done();
        }).catch(done);
      }).catch(done);
    });

it("Should update goal", function(done) {
  	
  	CrowdFunding.new({from: owner_account}).then(
  		function(crowdfunding) {
  			crowdfunding.fundGoal.call().then(
  				function(goal) { 
            console.log("\t** Old goal: " + goal.toNumber())
  					assert.equal(goal, 100000000000000000000, "Goal doesn't match!"); 
  			}).then(
  				function() { 
  					return crowdfunding.changeFundGoal(200000000000000000000);
  			}).then(
  				function() { 
  					return crowdfunding.fundGoal.call()
  			}).then(
  				function(goal) { 
  					assert.equal(goal, 200000000000000000000, "New goal is not correct!");
            console.log("\t** New goal: " + goal.toNumber())
            done();		
  			}).catch(done);
  	}).catch(done);
  });
});