//
// text_image_converter
//
// jshint asi: true

function text_to_image(text) {
  let charcodes = []
  for (let i in text) {
    charcodes.push(text.charCodeAt(i))
  }
  
  let width = Math.ceil(Math.sqrt(charcodes.length))
  
  let canvas = document.createElement('canvas')
  
  canvas.width = width
  canvas.height = width
  
  let ctx = canvas.getContext('2d')
  
  for (let i = 0; i < width ** 2; i++) {
    let x = i % width
    let y = (i - x) / width
    
    let channels = []
    let is_in_bound = i < charcodes.length
    
    let pixel_data
    
    if (is_in_bound) {
      let char = charcodes[i]
      
      let c2 = char % 256
      let c1 = (char - c2) / 256
      
      channels.push(c1, c2)
    } else {
      channels.push(0, 0)
    }
    
    pixel_data = get_hex([...channels, Math.floor(Math.random() * 256), 255])
    
    ctx.fillStyle = '#' + pixel_data
    ctx.fillRect(x, y, 1, 1)
  }
  return canvas.toDataURL()
}

function image_to_text(src) {
  let img = document.createElement('img')
  img.src = src
  return new Promise((resolve) =>{
    img.onload = () => {
      let canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      let ctx = canvas.getContext('2d')
      
      ctx.drawImage(img, 0, 0)
      
      let imgdata = ctx.getImageData(0, 0, img.width, img.height)
      let data = imgdata.data
      let text = ''
      for (let i = 0; i < data.length / 4; i++) {
        if (data[i * 4 + 0] + data[i * 4 + 1] != 0) {
          let charcode = data[i * 4] * 256 + data[i * 4 + 1]
          text += String.fromCharCode(charcode)
        }
      }
      resolve(text)
    }
  })
}

function get_hex(array) {
  let text = ''
  
  for (let byte of array) {
    let a2 = byte % 16
    let a1 = (byte - a2) / 16
    
    let chars = '0123456789abcdef'
    text += chars[a1] + chars[a2]
  }
  
  return text
}
function image_input() {
  let file = document.querySelector('input').files[0]
  let file_reader = new FileReader()
  
  file_reader.onload = async () => {
    let text = await image_to_text(file_reader.result)
    document.getElementById('output_text').value = text
  }
  
  file_reader.readAsDataURL(file)
}

function text_input() {
  let input = document.getElementById('textarea').value
  if (input.length < 8) {
    document.getElementById('output_img').hidden = true
    document.getElementById('output_img_alt').innerHTML = '<b>Input text was too short.<br>Text must be at least 8 chars.</b>'
    document.getElementById('output_img_alt').style.color = 'red'
  } else {
    let dataurl = text_to_image(input)
    document.getElementById('output_img').src = dataurl
    document.getElementById('output_img').hidden = false
    document.getElementById('output_img_alt').innerHTML = 'Image was created successfully.'
    document.getElementById('output_img_alt').style.color = 'black'
  }
}

