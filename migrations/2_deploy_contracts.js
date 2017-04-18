var CrowdFunding = artifacts.require("./CrowdFunding.sol");

module.exports = function(deployer) {
  deployer.deploy(CrowdFunding, {from: "0x27b311d2f0b9f3a0368e626042dd0af452aeeb3e"});
};
