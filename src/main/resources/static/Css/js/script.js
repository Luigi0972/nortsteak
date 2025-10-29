function buscar() {
    let input = document.getElementById("search").value.toLowerCase();
    let productos = document.getElementById("productos").getElementsByTagName("li");

    for (let i = 0; i < productos.length; i++) {
        let producto = productos[i].textContent.toLowerCase();
        if (producto.includes(input)) {
            productos[i].style.display = "";
        } else {
            productos[i].style.display = "none";
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
  const imagenes = [
    {
      src: "/Css/img/Vaca2.jpeg",
      titulo: "NortSteak",
      descripcion: "NortSteak es una plataforma de venta de cortes finos de carne. Nuestra prioridad es vender productos frescos de calidad premium"
    },
    {
      src: "/Css/img/Vaca5.jpg",
      titulo: "Norte de Santander",
      descripcion: "Todos los productos de nuestra plataforma son 100% de Norte de Santander, apoyando a nuestra ganadería local"
    },
    {
      src: "/Css/img/fondo carne.jpg",
      titulo: "Premium Beef",
      descripcion: "Aquí encontrarás los mejores cortes a precios razonables, para que puedas disfrutarlos con tu familia"
    }
  ];

  let index = 0;

  const img = document.querySelector(".img");
  const titulo = document.querySelector("#texto h3");
  const descripcion = document.querySelector("#texto p");

  const btnAtras = document.getElementById("atras");
  const btnAdelante = document.getElementById("adelante");

  function mostrarImagen() {
    const actual = imagenes[index];
    img.src = actual.src;
    titulo.innerText = actual.titulo;
    descripcion.innerText = actual.descripcion;
  }

  btnAdelante.addEventListener("click", () => {
    index = (index + 1) % imagenes.length;
    mostrarImagen();
  });

  btnAtras.addEventListener("click", () => {
    index = (index - 1 + imagenes.length) % imagenes.length;
    mostrarImagen();
  });

  mostrarImagen();

     const btnAtrasMovil = document.getElementById("atras-movil");
  const btnAdelanteMovil = document.getElementById("adelante-movil");

  if (btnAdelanteMovil && btnAtrasMovil) {
    btnAdelanteMovil.addEventListener("click", () => {
      index = (index + 1) % imagenes.length;
      mostrarImagen();
    });

    btnAtrasMovil.addEventListener("click", () => {
      index = (index - 1 + imagenes.length) % imagenes.length;
      mostrarImagen();
    });
  }


});
