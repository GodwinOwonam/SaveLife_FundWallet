let loginForm = document.getElementById("loginForm");
let fundwalletForm = document.getElementById("fundwalletForm");
let fundwalletEmail = document.getElementById('fundwalletEmail');
let fundWalletPhone = document.getElementById('fundwalletPhone');
let firstName = document.getElementById('firstName');
let lastName = document.getElementById('lastName');
let formAmount = document.getElementById('amount');
let formemail = document.getElementById('email');
let formpassword = document.getElementById('password');
// console.log(typeof(formemail.value),formpassword);
let loginBtn = document.getElementById('login');
let fundBtn = document.getElementById('fundBtn');
let welcomeText = document.getElementById('welcomeText');

fundwalletForm.classList.add('none');

let user_id = {'val':""};
// let loginDetails = {
//     email: formemail.value
//     password: formpassword.value
// }

loginForm.addEventListener('submit', (e)=>{
   e.preventDefault();  
});

fundwalletForm.addEventListener('submit', (e)=>{
    e.preventDefault();
})

loginBtn.addEventListener('click', ()=>{

    if(formemail.value && formpassword.value){
    // console.log(formemail.value,formpassword);
        
        handleLogin();
        
    }
});

fundBtn.addEventListener('click', ()=>{
    if(formAmount.value && user_id.val !== ""){
        payWithPaystack();
        // fundWallet(user_id.val, formAmount.value);

    }
});

function handleLogin(){
    console.log(formemail,formpassword);
    // let res = axios.post("http://127.0.0.1:8000/api/login", loginDetails);
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8000/api/login",
            headers:{
                "Access-Control-Allow-Origin":"*"
            },
            crossDomain: true,
            data:{'email':formemail.value, 'password':formpassword.value},
            
            success: function(response) {
                // let status = response.status;
                console.log(response);
                if(response.status === "success"){
                    loginForm.classList.add('none');
                    user_id.val = response.data.id;
                    getUserDetails(response.data.id);
                }
            },
            // dataType:'application/json'
        });
    
    // console.log(res);
    
}

function getUserDetails(user_id){
    if(user_id !== ""){
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8000/api/users/get-by-id",
            headers:{
                "Access-Control-Allow-Origin":"*"
            },
            crossDomain: true,
            data:{'user_id': user_id},
            
            success: function(response) {
                // let status = response.status;
                console.log(response);
                if(response.status === "success"){
                    fundwalletEmail.value = response.data.email;
                    fundWalletPhone.value = response.data.phone_number;
                    firstName.value = response.data.first_name;
                    lastName.value = response.data.last_name;

                    welcomeText.innerHTML = `Welcome ${response.data.first_name} ${response.data.last_name}! Fund your wallet!`;
                    fundwalletEmail.classList.add('none');
                    fundWalletPhone.classList.add('none');
                    firstName.classList.add('none');
                    lastName.classList.add('none');
                    fundwalletForm.classList.remove('none');
                
                    // window.location.href = "/Savelife/Wallet/fundwallet.html";
                }
            },
            // dataType:'application/json'
        });
   }
}

function payWithPaystack(){
    if(amount.value){
        let handler = PaystackPop.setup({
            key: 'pk_test_501149505a832a63c8dd210fef9ce5113d17a351', // Replace with your public key
            email: fundwalletEmail.value,
            first_name: firstName.value,
            last_name: lastName.value,
            amount: formAmount.value * 100,
            ref: ''+Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
            // label: "Optional string that replaces customer email"
            onClose: function(){
                alert('Window closed.');
            },
            callback: function(response){
                let reference = String(response.reference);
                // console.log(reference);
    
                $.ajax({
                    type: "GET",
                    url: "http://127.0.0.1:8000/api/payments/verify/"+reference,
                    headers:{
                        "Access-Control-Allow-Origin":"*"
                    },
                    crossDomain: true,
                    success: function(response) {
                        console.log(response);
                        if(response[0].status == true){
                          fundwalletForm.append(`
                              <h2>${response[0].message}</h2>
                          `);
                          console.log(user_id.val, formAmount.value);

                          fundWallet(user_id.val, formAmount.value);
    
                        }
                        else{
                          $["form"].prepend("<h2>Verification Failed</h2>");
                        }
                    }
                });
            }
        });
        handler.openIframe();
    }
}

function fundWallet(user_id, amount){
    if(user_id && amount){
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8000/api/wallet/fund/"+JSON.stringify({'user_id': user_id, 'amount':amount}),
            headers:{
                "Access-Control-Allow-Origin":"*"
            },
            crossDomain: true,
            // data:,
            
            success: function(response) {
                console.log(response);
                if(response.message){
                    fundwalletForm.append(`<h6>${response.message}</h6>`);
                }
            },
            // dataType:'application/json'
        });
   }
}