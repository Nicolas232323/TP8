"use client";

import { useEffect, useState, useRef } from "react";
import styles from './page.module.css';

export default function Home() {
  const [paises, setPaises] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);
  const [adivinanzaUsuario, setAdivinanzaUsuario] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [nombreJugador, setNombreJugador] = useState("");
  const [jugando, setJugando] = useState(false);
  const [temporizador, setTemporizador] = useState(15);
  const [mensaje, setMensaje] = useState("");
  const [pista, setPista] = useState("");
  const temporizadorRef = useRef(null);

  useEffect(() => {
    const jugadoresGuardados = JSON.parse(localStorage.getItem("players")) || [];
    if (jugadoresGuardados.length > 0) {
      console.log("Jugadores guardados:", jugadoresGuardados);
    }
  }, []);

  useEffect(() => {
    const obtenerPaises = async () => {
      try {
        const respuesta = await fetch(
          "https://countriesnow.space/api/v0.1/countries/flag/images"
        );
        const datos = await respuesta.json();
        console.log("Datos de países:", datos.data); 
        setPaises(datos.data); 
      } catch (error) {
        console.error("Error al obtener países:", error);
      }
    };

    obtenerPaises();
  }, []);


  const seleccionarPaisAleatorio = () => {
    if (paises.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * paises.length);
      setPaisSeleccionado(paises[indiceAleatorio]);
      setPista("");
      reiniciarTemporizador();
    }
  };

  useEffect(() => {
    if (jugando && temporizador > 0) {
      temporizadorRef.current = setTimeout(() => setTemporizador(temporizador - 1), 1000);
    } else if (temporizador === 0) {
      setMensaje(`Tiempo agotado. La respuesta correcta era: ${paisSeleccionado.name}`);
      setPuntos(puntos - 1); 
      seleccionarPaisAleatorio();
    }
    return () => clearTimeout(temporizadorRef.current); 
  }, [temporizador, jugando]);


  const reiniciarTemporizador = () => {
    clearTimeout(temporizadorRef.current);
    setTemporizador(15);
  };


  const manejarAdivinanza = (e) => {
    e.preventDefault();
    if (!jugando) return;

   
    if (adivinanzaUsuario.toLowerCase() === paisSeleccionado.name.toLowerCase()) {
      const bonusTiempo = temporizador; 
      setPuntos(puntos + 10 + bonusTiempo);
      setMensaje(`¡Correcto! Ganaste 10 puntos y ${bonusTiempo} puntos extra por el tiempo.`);
    } else {
      setPuntos(puntos - 1); 
      setMensaje(`¡Incorrecto! La respuesta correcta era: ${paisSeleccionado.name}. Pierdes 1 punto.`);
    }

    setAdivinanzaUsuario("");
    seleccionarPaisAleatorio();
  };

 
  const manejarPista = () => {
    if (temporizador > 2) {
      setPista(paisSeleccionado.name.slice(0, pista.length + 1));
      setTemporizador(temporizador - 2);
    }
  };

 
  const iniciarJuego = () => {
    if (nombreJugador.trim() === "") {
      setMensaje("Por favor, ingresa tu nombre para jugar.");
      return;
    }
    setJugando(true);
    seleccionarPaisAleatorio();
    setPuntos(0);
  };

  
  useEffect(() => {
    if (!jugando && puntos > 0) {
      const jugadoresGuardados = JSON.parse(localStorage.getItem("players")) || [];
      const nuevoJugador = { name: nombreJugador, score: puntos };
      const jugadoresActualizados = [...jugadoresGuardados, nuevoJugador];
      localStorage.setItem("players", JSON.stringify(jugadoresActualizados));
    }
  }, [jugando, puntos, nombreJugador]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Adivina la bandera</h1>

      {!jugando ? (
        <div>
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            value={nombreJugador}
            onChange={(e) => setNombreJugador(e.target.value)}
            className={styles.input}
          />
          <button onClick={iniciarJuego} className={styles.button}>
            Iniciar Juego
          </button>
        </div>
      ) : (
        <div>
          <div className={styles.flagContainer}>
            <img src={paisSeleccionado.flag} alt="Bandera" className={styles.flag} />
            <p className={styles.timer}>Tiempo restante: {temporizador}s</p>
          </div>

          <form onSubmit={manejarAdivinanza} className={styles.form}>
            <input
              type="text"
              value={adivinanzaUsuario}
              onChange={(e) => setAdivinanzaUsuario(e.target.value)}
              placeholder="¿A qué país pertenece?"
              className={styles.input}
            />
            <button type="submit" className={styles.button}>
              Adivinar
            </button>
            <button type="button" onClick={manejarPista} className={styles.button}>
              Pedir ayuda (resta 2s)
            </button>
          </form>

          {pista && <p>Pista: {pista}</p>}

          <p className={styles.message}>{mensaje}</p>
          <h2 className={styles.points}>Puntos: {puntos}</h2>
        </div>
      )}
    </div>
  );
}
