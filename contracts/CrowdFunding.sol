pragma solidity ^0.4.8;

contract CrowdFunding {
    
	address public contract_owner;
	mapping (address => uint) public donors; // map to store donor and amount list
	uint public fundGoal;

	event NewFundAdded(address _from, uint _amount); 
	event FundRefunded(address _to, uint _amount); 

	function CrowdFunding() {
		contract_owner = msg.sender;	  //set the owner
		fundGoal = 100000000000000000000; //wei, not ether
	}

	function fundProject() payable public {
		address fundAddress = this;
		if (fundAddress.balance + msg.value > fundGoal) { 
			//throw; //simple check to prevent overfunding
		}		
		donors[msg.sender] += msg.value;
		NewFundAdded(msg.sender, msg.value);
	}

	function refundMoney(address donor) payable public {		
		if (msg.sender != contract_owner) { 
			return; 
		}
			uint amount = donors[donor];
			address fundAddress = this;
			if (fundAddress.balance >= amount) { 
				if(!donor.send(amount)) {
					//throw;
				}
				FundRefunded(donor, amount);
				donors[donor] = 0;			//simply setting to 0. LATER: use a struct
			}		
		return;
	}

    function changeFundGoal(uint newGoal) public {
		if (msg.sender != contract_owner) { return; }
		fundGoal = newGoal;
	}

	function getFundGoal() public returns (uint goal) {
		return fundGoal;
	}

	function getDonationAmount(address addr) public returns(uint donationAmount) {
		return donors[addr];
	}

	function destroy() {
		if (msg.sender == contract_owner) {
			selfdestruct(contract_owner);
		}
	}
}