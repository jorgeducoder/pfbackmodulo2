/**
 * Pequeña clase tipo DTO (Data Transfer Object)
 * 
 * El concepto es generar una capa intermedia que normalice los datos antes de ser
 * enviados definitivamente al servicio para que éste genere la consulta a la base.
 * 
 * De esta forma podremos normalizar el formato de las distintas propiedades.
 */

class UserDTO {
    constructor(data) {
        this.firstName = data.firstName?.trim();
        this.lastName = data.lastName?.trim().toUpperCase();
        this.email = data.email?.toLowerCase().trim();
    }
}

export default UserDTO;
