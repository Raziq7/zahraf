function wishList(){
    var list = document.getElementById("toast");
  list.classList.add("show");
  list.innerHTML = '<i class="far fa-heart wish"></i> Product added to List';
  setTimeout(function(){
    list.classList.remove("show");
  },3000);
}

function addCard(){
      var card = document.getElementById("toast-card");
  card.classList.add("show");
  card.innerHTML = '<i class="fas fa-shopping-card card"></i> Product added to card';
  setTimeout(function(){
    card.classList.remove("show");
  }, 3000);
}