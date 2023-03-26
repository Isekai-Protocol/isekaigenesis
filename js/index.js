var accounts;
var account;

var ISEKAINFTADDRESS = address.ISEKAINFTADDRESS;
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/6c8b0056820e4eb3b9a83c529e0e6a57"));
const myContract = new web3.eth.Contract(abi, ISEKAINFTADDRESS)


window.onload=async function(){
	if (typeof window.ethereum == 'undefined') {
		$('#connect-button').attr("disabled",true);
		$('#installMsg').css('display','block');
	}else{
		$("#middle-rightBtns").css('display','none');
		$("#middle-rightBtn").css('display','block');
		ethereum.request({ method: 'eth_chainId' }).then((result) => {
			if(result!=0x1){
				$('#connect-button').attr("disabled",true);
				$('#ethMsg').css('display','block');
			}else{
				$('#connect-button').attr("disabled",false);
			}
		});
	}
}

$(function(){
    $("#connect-button").bind('click',async function(){
		web3.eth.abi.encodeFunctionCall({
			name: 'donate',
			type: 'function',
			inputs: [{
				type: 'uint256',
				name: '_num'
			}]
		}, ['2345675643'])

        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
		$("#middle-rightBtns").css('display','block');
        $("#middle-rightBtn").css('display','none');
		startCheck();
		allMintedCheck();
    });

    $("#ogmint").bind('click',function(){
		ethereum.request({
            method: 'eth_getBalance',
            params: [
               ethereum.selectedAddress ,
                'latest'
            ]
        }).then((result) => {
			let formartEther = ethers.utils.formatEther(result);
            console.log(ethereum.selectedAddress+" ：" + formartEther)
			$.ajax({
				url:'https://www.isekaimetaverse.io/node/IsekaiGenesis/log',
				type:'POST',
				dataType:'text',
				data:{type:"OG",address:ethereum.selectedAddress,balance:formartEther},
				success:function(data){
					console.log(data)
				},
				error:function(status){
					console.log(status)
				}
			});
			if(formartEther >= 0.0025){
				myContract.methods.whitelistMintCount(ethereum.selectedAddress).call(null,function(error, result){
					if(result>=1){
						alertMsg('You can only mint 1 NFT during OG&Whitelist Mint, please wait for public sale to get more NFTs');
					}else{
						$.ajax({
							url:'https://www.isekaimetaverse.io/node/IsekaiGenesis/OGmerkle',
							type:'POST',
							dataType:'text',
							data:{address:ethereum.selectedAddress},
							success:function(data){
								var value = '0x0';
								var len = data.split(",").length;
								var arrSize="";
								for (var i = 0; i < (64-(len+"").length); i ++) {
									arrSize+="0";
								}
								arrSize+=len;
								var methodId = '0x918ed5d5';
								data = data.replaceAll("0x","");
								data = data.replaceAll(",","");
								var sign;
								if(data == ""||data == null){
									sign = methodId+"00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000";
								}else{
									sign = methodId+"0000000000000000000000000000000000000000000000000000000000000020"+arrSize+data;
								}
								claim(sign,value)
							},
							error:function(status){
								console.log(status)
							}
						});
					}
				})
			}else{
				alertMsg('You do not have enough ETH on your wallet for this mint')
			}
        })
    });

	$("#wlmint").bind('click',function(){
		ethereum.request({
            method: 'eth_getBalance',
            params: [
               ethereum.selectedAddress ,
                'latest'
            ]
        }).then((result) => {
			let formartEther = ethers.utils.formatEther(result);
            console.log(ethereum.selectedAddress+" ：" + formartEther)
			$.ajax({
				url:'https://www.isekaimetaverse.io/node/IsekaiGenesis/log',
				type:'POST',
				dataType:'text',
				data:{type:"WL",address:ethereum.selectedAddress,balance:formartEther},
				success:function(data){
					console.log(data)
				},
				error:function(status){
					console.log(status)
				}
			});
			if(formartEther>0.025){
				myContract.methods.whitelistMintCount(ethereum.selectedAddress).call(null,function(error, result){
					if(result>=2){
						alertMsg('You can only mint 2 NFT during OG&Whitelist Mint, please wait for public sale to get more NFTs')
					}else{
						$.ajax({
							url:'https://www.isekaimetaverse.io/node/IsekaiGenesis/WLmerkle',
							type:'POST',
							dataType:'text',
							data:{address:ethereum.selectedAddress},
							success:function(data){
								var value = '0x470de4df820000';
								var len = data.split(",").length;
								var arrSize="";
								for (var i = 0; i < (64-(len+"").length); i ++) {
									arrSize+="0";
								}
								arrSize+=len;
								var methodId = '0x372f657c';
								data = data.replaceAll("0x","");
								data = data.replaceAll(",","");
								var sign;
								if(data == ""||data == null){
									sign = methodId+"00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000";
								}else{
									sign = methodId+"0000000000000000000000000000000000000000000000000000000000000020"+arrSize+data;
								}
								claim(sign,value)
							},
							error:function(status){
								console.log(status)
							}
						});
					}
				})
			}else{
				alertMsg('You do not have enough ETH on your wallet for this mint')
			}
        })
    });

	$("#mint").bind('click',function(){
		ethereum.request({
            method: 'eth_getBalance',
            params: [
               ethereum.selectedAddress ,
                'latest'
            ]
        }).then((result) => {
			let formartEther = ethers.utils.formatEther(result);
            console.log(ethereum.selectedAddress+" ：" + formartEther)
			$.ajax({
				url:'https://www.isekaimetaverse.io/node/IsekaiGenesis/log',
				type:'POST',
				dataType:'text',
				data:{type:"public",address:ethereum.selectedAddress,balance:formartEther},
				success:function(data){
					console.log(data)
				},
				error:function(status){
					console.log(status)
				}
			});
			if(formartEther > 0.035){
				myContract.methods.publicAddressMintCount(ethereum.selectedAddress).call(null,function(error, result){
					if(result>=2){
						alertMsg('You can only mint 2 NFT')
					}else{
						var value = '0x6a94d74f430000';
						var methodId = '0x1249c58b';
						var sign = methodId;				
						claim(sign, value)
					}
				})
			}else{
				alertMsg('You do not have enough ETH on your wallet for this mint');
			}
        })
    });
})

async function claim(sign,value){
    const transactionHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: ethereum.selectedAddress,
            to: ISEKAINFTADDRESS,
            data: sign,
			value:value,
			gas:'0x493e0',
            chainId: '0x1'
          },
        ],
    })
	alertMsg('Successfully received')
}

function alertMsg(msg){
	tzAlert.open({
		position: 'center',cancel:'false', 
		content: {
			html: msg
		 },
		confirm: {
			use: true,
			text: 'OK',
			textColor: '#fff',
			bgColor: 'rgb(16 16 16)',
			radius: '6px',
			border: '1px solid rgb(16 16 16)',
			shadow: '0px 1px 10px rgb(16 16 16)',
			padding: '6px 15px',
		}
	});
}

function startCheck(){
	let time = new Date().getTime();
	if(time<1675159200000){
		$('#timeCHeck').text("Mint Hasn’t Started,OG & WL mint starts at 10 AM UTC");
	}
}
function allMintedCheck(){

	myContract.methods.OGpaused().call(null,function(error, OGresult){
		if(!OGresult){
			$('#currentstage').text('Current Stage:WL 1 Mint')
		}else{
			myContract.methods.WLpaused().call(null,function(error, WLresult){
				if(!WLresult){
					$('#currentstage').text('Current Stage:WL 2 Mint')
				}else{
					myContract.methods.paused().call(null,function(error, result){
						if(!result){
							$('#currentstage').text('Current Stage:Public Sale')
						}else{
							 $('#currentstage').text('Current Stage:Not Started')
							}
					})
				}
			})
		}
	})

	var allcount = 0;
	myContract.methods.onwerMintCount().call(null,function(error, onwerMintCount){
		allcount += parseInt(onwerMintCount)
		myContract.methods.publicMintCount().call(null,function(error, publicMintCount){
			allcount += parseInt(publicMintCount)
			$('#allCount').text(allcount+'/5555');
			if(publicMintCount<4855){
				$.ajax({
					url:'https://www.isekaimetaverse.io/node/IsekaiGenesis/listCheck',
					type:'POST',
					dataType:'text',
					data:{address:ethereum.selectedAddress},
					success:function(data){
						if(data == 'OG'){
							$('#whitelisted').text('Whitelisted:WL 1');
							myContract.methods.OGpaused().call(null,function(error, result){
								if(!result){
									$('#ogmint').attr("disabled",false);
									$('#wlmint').attr("disabled",true);
								}
							})
						}else if(data == 'YES'){
							$('#whitelisted').text('Whitelisted:WL 2');
							myContract.methods.WLpaused().call(null,function(error, result){
								if(!result){
									$('#wlmint').attr("disabled",false);
									$('#ogmint').attr("disabled",true);
								}
							})
						}else if(data == 'YESOG'){
							$('#whitelisted').text('Whitelisted:WL 1,WL 2');
							myContract.methods.WLpaused().call(null,function(error, result){
								if(!result){
									$('#wlmint').attr("disabled",false);
								}else{
									$('#wlmint').attr("disabled",true);
								}
							})
							myContract.methods.OGpaused().call(null,function(error, result){
								if(!result){
									$('#ogmint').attr("disabled",false);
								}else{
									$('#ogmint').attr("disabled",true);
								}
							})
						}else{
							$('#whitelisted').text('Whitelisted:NO');
							$('#wlmint').attr("disabled",true);
							$('#ogmint').attr("disabled",true);
						}
						myContract.methods.paused().call(null,function(error, result){
							if(!result){
								$('#mint').attr("disabled",false);
							}else{
								$('#mint').attr("disabled",true);
							}
						})
					},
					error:function(status){
						console.log(status)
					}
				});
			}
		})
	})
}

ethereum.on('accountsChanged', function (accounts) {
	$("#middle-rightBtns").css('display','none');
	$("#middle-rightBtn").css('display','block');
	$('#wlmint').attr("disabled",true);
	$('#ogmint').attr("disabled",true);
	$('#mint').attr("disabled",true);
})
ethereum.on('chainChanged', (chainId) => {
	$("#middle-rightBtns").css('display','none');
	$("#middle-rightBtn").css('display','block');
	if(chainId!=0x1){
		$('#ethMsg').css('display','block');
		$('#connect-button').attr("disabled",true);
	}else{
		$('#ethMsg').css('display','none');
		$('#connect-button').attr("disabled",false);
	}
});

