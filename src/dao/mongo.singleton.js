/**
 * Clase tipo SINGLETON
 * 
 * El patrón singleton especifica que debe existir una y solo una
 * instancia de un determinado objeto en un momento dado.
 * 
 * En este caso lo utilizmos para asegurar que siempre haya una
 * y solo una conexión a la base de datos. A partir de ahora ya
 * no conectamos de forma directa, sino llamando al método getInstance()
 * de esta clase.
 */

import mongoose from 'mongoose';
import config from '../config.js';

export default class MongoSingleton {
    static #instance;

    constructor() {
        this.connect();
    }
    
    async connect() {
        await mongoose.connect(config.MONGODB_URI);
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new MongoSingleton();
            console.log('Conexión bbdd CREADA');
        } else {
            console.log('Conexión bbdd RECUPERADA');
        }

        return this.#instance;
    }
}
