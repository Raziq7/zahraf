function imageView() {
    console.log('hello')
    const imagebox = document.getElementById('image-box1')
    const crop_btn = document.getElementById('crop-btn1')
    var fileInput = document.getElementById('file1');
    
    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.exec(filePath)) {
      fileInput.value = '';
      swal("Ther is a problem!", "...File Must be Image!");
      return false;
    } else {
      //Image preview
      const img_data = fileInput.files[0]
      const url = URL.createObjectURL(img_data)
      imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
      const image = document.getElementById('image')
      document.getElementById('image-box1').style.display = 'block'
      document.getElementById('crop-btn1').style.display = 'block'
      document.getElementById('confirm-btn1').style.display = 'none'
    
      const cropper = new Cropper(image, {
        autoCropArea: 1,
        viewMode: 1,
        scalable: false,
        zoomable: false,
        movable: false,
        aspectRatio: 30 / 19,
        //preview: '.preview',
        minCropBoxWidth: 180,
        minCropBoxHeight: 240,
      })
      crop_btn.addEventListener('click', () => {
        cropper.getCroppedCanvas().toBlob((blob) => {
          let fileInputElement = document.getElementById('file1');
          let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
          let container = new DataTransfer();
    
          container.items.add(file);
          const img = container.files[0]
          var url = URL.createObjectURL(img)
          fileInputElement.files = container.files;
          document.getElementById('viewProImage1').src = url
          document.getElementById('viewProImage1').style.display='block'
          document.getElementById('image-box1').style.display = 'none'
          document.getElementById('viewImage').style.display='none'
          document.getElementById('crop-btn1').style.display = 'none'
          document.getElementById('confirm-btn1').style.display = 'block'
        }, 'image/webp', 0.5);
      });
    }
    }