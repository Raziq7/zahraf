// function deleteCatOffer(catOfferId,itemName){
//     console.log("hello")
//     let confirm=confirm('do you want delete');
//     if(confirm){
//       $.ajax({
//         url:"/admin/deleteOffer",
//             method:"POST",
//             data:{catOfferId,itemName},
//             success:(result)=>{
//               if(result.status){
//               alert("Offer deleted Successfully")
//               }
//             }
//       })
//     }
//   }

function myFunction() {
    var x = document.getElementById("myInput").value;
    
    if(x.length<6){
    document.getElementById("err").innerHTML = "mniumum 6 characters";
  }
  else if(x.length>6){
    document.getElementById("err").innerHTML = "";
   } 
   }

       