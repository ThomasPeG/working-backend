import { CreateJobTypeDto } from '../dto/create-job-type.dto';

export const jobTypesData: CreateJobTypeDto[] = [
  // Tecnología y Desarrollo
  { name: 'Desarrollador Frontend', category: 'Tecnología y Desarrollo', description: 'Especialista en interfaces de usuario y experiencia de usuario' },
  { name: 'Desarrollador Backend', category: 'Tecnología y Desarrollo', description: 'Especialista en lógica de servidor y bases de datos' },
  { name: 'Desarrollador Full Stack', category: 'Tecnología y Desarrollo', description: 'Desarrollador con habilidades tanto en frontend como en backend' },
  { name: 'Ingeniero DevOps', category: 'Tecnología y Desarrollo', description: 'Especialista en integración y despliegue continuo' },
  { name: 'Arquitecto de Software', category: 'Tecnología y Desarrollo', description: 'Diseña la estructura y componentes de aplicaciones' },
  { name: 'Científico de Datos', category: 'Tecnología y Desarrollo', description: 'Analiza grandes volúmenes de datos para extraer información valiosa' },
  { name: 'Ingeniero de Machine Learning', category: 'Tecnología y Desarrollo', description: 'Desarrolla algoritmos y modelos de aprendizaje automático' },
  { name: 'Especialista en Ciberseguridad', category: 'Tecnología y Desarrollo', description: 'Protege sistemas y redes contra amenazas' },
  { name: 'Administrador de Sistemas', category: 'Tecnología y Desarrollo', description: 'Gestiona y mantiene sistemas informáticos' },
  { name: 'Administrador de Bases de Datos', category: 'Tecnología y Desarrollo', description: 'Gestiona y optimiza bases de datos' },
  
  // Salud y Medicina
  { name: 'Médico General', category: 'Salud y Medicina', description: 'Profesional de la salud que diagnostica y trata enfermedades comunes' },
  { name: 'Enfermero/a', category: 'Salud y Medicina', description: 'Proporciona cuidados a pacientes bajo supervisión médica' },
  { name: 'Cirujano', category: 'Salud y Medicina', description: 'Médico especializado en intervenciones quirúrgicas' },
  { name: 'Pediatra', category: 'Salud y Medicina', description: 'Médico especializado en la salud de niños y adolescentes' },
  { name: 'Psicólogo', category: 'Salud y Medicina', description: 'Profesional que estudia el comportamiento y procesos mentales' },
  { name: 'Fisioterapeuta', category: 'Salud y Medicina', description: 'Especialista en rehabilitación física' },
  { name: 'Odontólogo', category: 'Salud y Medicina', description: 'Profesional especializado en salud dental' },
  { name: 'Farmacéutico', category: 'Salud y Medicina', description: 'Experto en medicamentos y su uso' },
  { name: 'Nutricionista', category: 'Salud y Medicina', description: 'Especialista en alimentación y nutrición' },
  { name: 'Técnico de Laboratorio', category: 'Salud y Medicina', description: 'Realiza análisis clínicos y pruebas diagnósticas' },
  
  // Educación
  { name: 'Profesor de Primaria', category: 'Educación', description: 'Educador de niños en etapa escolar básica' },
  { name: 'Profesor de Secundaria', category: 'Educación', description: 'Educador especializado en materias para adolescentes' },
  { name: 'Profesor Universitario', category: 'Educación', description: 'Docente de educación superior' },
  { name: 'Director Escolar', category: 'Educación', description: 'Administra y supervisa instituciones educativas' },
  { name: 'Orientador Educativo', category: 'Educación', description: 'Guía a estudiantes en su desarrollo académico y personal' },
  { name: 'Educador Especial', category: 'Educación', description: 'Especialista en enseñanza para personas con necesidades especiales' },
  { name: 'Tutor', category: 'Educación', description: 'Proporciona enseñanza personalizada' },
  { name: 'Bibliotecario', category: 'Educación', description: 'Gestiona recursos bibliográficos y promueve la lectura' },
  
  // Finanzas y Negocios
  { name: 'Contador', category: 'Finanzas y Negocios', description: 'Gestiona registros financieros y prepara informes contables' },
  { name: 'Analista Financiero', category: 'Finanzas y Negocios', description: 'Evalúa inversiones y tendencias financieras' },
  { name: 'Gerente de Proyectos', category: 'Finanzas y Negocios', description: 'Planifica, ejecuta y supervisa proyectos' },
  { name: 'Consultor de Negocios', category: 'Finanzas y Negocios', description: 'Asesora empresas para mejorar su rendimiento' },
  { name: 'Especialista en Marketing', category: 'Finanzas y Negocios', description: 'Desarrolla estrategias para promocionar productos o servicios' },
  { name: 'Recursos Humanos', category: 'Finanzas y Negocios', description: 'Gestiona el personal y políticas laborales' },
  { name: 'Economista', category: 'Finanzas y Negocios', description: 'Analiza datos económicos y predice tendencias' },
  { name: 'Auditor', category: 'Finanzas y Negocios', description: 'Examina registros financieros para verificar su precisión' },
  
  // Artes y Diseño
  { name: 'Diseñador Gráfico', category: 'Artes y Diseño', description: 'Crea elementos visuales para comunicar mensajes' },
  { name: 'Diseñador UX/UI', category: 'Artes y Diseño', description: 'Diseña interfaces y experiencias de usuario' },
  { name: 'Fotógrafo', category: 'Artes y Diseño', description: 'Captura imágenes con fines artísticos o comerciales' },
  { name: 'Ilustrador', category: 'Artes y Diseño', description: 'Crea imágenes para libros, publicaciones o medios digitales' },
  { name: 'Arquitecto', category: 'Artes y Diseño', description: 'Diseña edificios y estructuras' },
  { name: 'Diseñador de Interiores', category: 'Artes y Diseño', description: 'Planifica y diseña espacios interiores' },
  { name: 'Diseñador de Moda', category: 'Artes y Diseño', description: 'Crea prendas y accesorios de vestir' },
  
  // Servicios
  { name: 'Chef', category: 'Servicios', description: 'Profesional de la cocina que crea y prepara platos' },
  { name: 'Peluquero', category: 'Servicios', description: 'Especialista en corte y estilismo de cabello' },
  { name: 'Entrenador Personal', category: 'Servicios', description: 'Guía y motiva en programas de ejercicio físico' },
  { name: 'Electricista', category: 'Servicios', description: 'Instala y repara sistemas eléctricos' },
  { name: 'Plomero', category: 'Servicios', description: 'Instala y repara sistemas de tuberías' },
  { name: 'Mecánico', category: 'Servicios', description: 'Repara y mantiene vehículos' },
  { name: 'Carpintero', category: 'Servicios', description: 'Trabaja la madera para crear estructuras o muebles' },
  { name: 'Jardinero', category: 'Servicios', description: 'Mantiene y diseña espacios verdes' },
  
  // Comunicación y Medios
  { name: 'Periodista', category: 'Comunicación y Medios', description: 'Investiga y reporta noticias' },
  { name: 'Redactor', category: 'Comunicación y Medios', description: 'Crea contenido escrito para diversos medios' },
  { name: 'Community Manager', category: 'Comunicación y Medios', description: 'Gestiona la presencia en redes sociales' },
  { name: 'Relaciones Públicas', category: 'Comunicación y Medios', description: 'Gestiona la imagen pública de organizaciones' },
  { name: 'Productor Audiovisual', category: 'Comunicación y Medios', description: 'Coordina la producción de contenido audiovisual' },
  { name: 'Locutor', category: 'Comunicación y Medios', description: 'Comunica mensajes a través de radio o televisión' },
  
  // Transporte y Logística
  { name: 'Conductor', category: 'Transporte y Logística', description: 'Opera vehículos para transportar personas o mercancías' },
  { name: 'Piloto', category: 'Transporte y Logística', description: 'Conduce aeronaves' },
  { name: 'Capitán de Barco', category: 'Transporte y Logística', description: 'Dirige embarcaciones marítimas' },
  { name: 'Gerente de Logística', category: 'Transporte y Logística', description: 'Coordina el movimiento y almacenamiento de bienes' },
  { name: 'Controlador de Tráfico Aéreo', category: 'Transporte y Logística', description: 'Gestiona el tráfico de aeronaves' },
  
  // Legal
  { name: 'Abogado', category: 'Legal', description: 'Proporciona asesoramiento legal y representa a clientes' },
  { name: 'Juez', category: 'Legal', description: 'Preside tribunales y emite sentencias' },
  { name: 'Notario', category: 'Legal', description: 'Certifica documentos y actos jurídicos' },
  { name: 'Paralegal', category: 'Legal', description: 'Asiste a abogados en tareas legales' },
  
  // Ciencia e Investigación
  { name: 'Biólogo', category: 'Ciencia e Investigación', description: 'Estudia organismos vivos y sus interacciones' },
  { name: 'Químico', category: 'Ciencia e Investigación', description: 'Investiga la composición y propiedades de la materia' },
  { name: 'Físico', category: 'Ciencia e Investigación', description: 'Estudia la materia, energía y sus interacciones' },
  { name: 'Astrónomo', category: 'Ciencia e Investigación', description: 'Estudia cuerpos celestes y fenómenos cósmicos' },
  { name: 'Geólogo', category: 'Ciencia e Investigación', description: 'Estudia la estructura y composición de la Tierra' },
  { name: 'Arqueólogo', category: 'Ciencia e Investigación', description: 'Estudia restos materiales de sociedades pasadas' },
  
  // Agricultura y Medio Ambiente
  { name: 'Agricultor', category: 'Agricultura y Medio Ambiente', description: 'Cultiva plantas y cría animales para producción' },
  { name: 'Ingeniero Agrónomo', category: 'Agricultura y Medio Ambiente', description: 'Aplica ciencia y tecnología a la agricultura' },
  { name: 'Veterinario', category: 'Agricultura y Medio Ambiente', description: 'Cuida la salud de animales' },
  { name: 'Ecologista', category: 'Agricultura y Medio Ambiente', description: 'Estudia las relaciones entre organismos y su entorno' },
  { name: 'Guardabosques', category: 'Agricultura y Medio Ambiente', description: 'Protege y gestiona áreas naturales' },
];