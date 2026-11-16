import { Plant } from '../types';

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'ciclamen-colgante',
    name: 'Ciclamen Colgante',
    scientificName: 'Cyclamen persicum',
    origin: 'Mediterráneo y Oriente Medio',
    light: 'Media sombra',
    price: 28000,
    categories: ['Todas', 'Florales', 'Colgantes', 'Sombra'],
    inStock: false,
    imageUrl: '/images/ciclamen-colgante.jpg',
    description: 'Planta de floración invernal y primaveral con pétalos aterciopelados y hojas marmoladas en forma de corazón. Adaptada a la técnica japonesa de kokedama para colgar en galerías o interiores frescos.',
    wateringGuide: 'Por inmersión 10-15 min cada 5-7 días. Evitar mojar el bulbo directamente.',
    lightGuide: 'Media sombra o luz indirecta abundante. No tolera el sol directo ni calefacción fuerte.',
    careTips: [
      'Sumergir la bola de musgo en agua a temperatura ambiente.',
      'Escurrir suavemente sin presionar excesivamente el bulbo.',
      'Mantener en un lugar aireado y fresco (10°C - 18°C).'
    ]
  },
  {
    id: 'gerbera-fucsia',
    name: 'Gerbera Fucsia',
    scientificName: 'Gerbera jamesonii',
    origin: 'Sudáfrica',
    light: 'Sol suave',
    price: 30000,
    categories: ['Todas', 'Florales'],
    inStock: true,
    imageUrl: '/images/gerbera-fucsia.jpg',
    description: 'Vibrante gerbera de pétalos fucsias intensos montada en musgo natural. Aporta energía y color a escritorios, mesas y rincones luminosos.',
    wateringGuide: 'Riego por inmersión semanal (7-9 días). Dejar secar ligeramente la superficie del musgo.',
    lightGuide: 'Mucha luz natural y sol suave de la mañana. Proteger del sol del mediodía en verano.',
    careTips: [
      'Controlar el peso de la kokedama: si está liviana, necesita agua.',
      'Sumergir 10 minutos hasta que dejen de salir burbujas.',
      'Retirar flores y hojas secas desde la base para estimular nuevos capullos.'
    ]
  },
  {
    id: 'anturio-rojo',
    name: 'Anturio Rojo',
    scientificName: 'Anthurium andraeanum',
    origin: 'Colombia y Ecuador',
    light: 'Luz filtrada',
    price: 45000,
    categories: ['Todas', 'Florales', 'Sombra'],
    inStock: false,
    imageUrl: '/images/anturio-rojo.jpg',
    description: 'Elegancia pura con espatas rojas brillantes de textura cerosa y follaje verde esmeralda. Una de las kokedamas más sofisticadas para interiores.',
    wateringGuide: 'Riego cada 5-7 días por inmersión. Pulverizar las hojas con agua sin cal.',
    lightGuide: 'Luz filtrada brillante. Muy sensible al sol directo que quema sus hojas.',
    careTips: [
      'Pulverizar el follaje 2 veces por semana para conservar humedad ambiental.',
      'Sumergir la esfera de musgo durante 15 minutos.',
      'Proteger de corrientes de aire frío.'
    ]
  },
  {
    id: 'suculenta-jade',
    name: 'Suculenta Jade',
    scientificName: 'Crassula ovata',
    origin: 'Sudáfrica',
    light: 'Luz brillante',
    price: 15000,
    categories: ['Todas', 'Color'],
    inStock: true,
    imageUrl: '/images/jade.jpg',
    description: 'El célebre "árbol de la abundancia" o planta de jade. Hojas carnosas y porte escultural en kokedama, sumamente resistente y fácil de cuidar.',
    wateringGuide: 'Inmersión cada 12 a 15 días. Requiere secado completo entre riegos.',
    lightGuide: 'Luz solar brillante o sol directo templado para acentuar los bordes rojizos de sus hojas.',
    careTips: [
      'Espaciar los riegos: es una planta crasa que almacena agua.',
      'Si las hojas se arrugan levemente, sumergir 10 minutos.',
      'Excelente opción para principiantes.'
    ]
  },
  {
    id: 'kalanchoe',
    name: 'Kalanchoe',
    scientificName: 'Kalanchoe blossfeldiana',
    origin: 'Madagascar',
    light: 'Luz brillante',
    price: 25000,
    categories: ['Todas', 'Florales', 'Color'],
    inStock: true,
    imageUrl: '/images/kalanchoe.jpeg',
    description: 'Generosa floración en ramilletes compactos y vivos. Muy longeva y alegre, perfecta para dar toques de calidez al hogar.',
    wateringGuide: 'Inmersión cada 8 a 10 días.',
    lightGuide: 'Luz abundante. Tolera sol suave matutino que estimula brotes.',
    careTips: [
      'Regar solo cuando el musgo esté seco al tacto.',
      'Ubicación con buena ventilación.',
      'Cortar ramas marchitas para promover rebrotes continuos.'
    ]
  },
  {
    id: 'begonia',
    name: 'Begonia',
    scientificName: 'Begonia semperflorens',
    origin: 'Brasil',
    light: 'Media sombra',
    price: 20000,
    categories: ['Todas', 'Florales', 'Color'],
    inStock: true,
    imageUrl: '/images/begonia.jpg',
    description: 'Hojas carnosas de brillo satinado y flores continuas. Muy noble y agradecida con mínimos cuidados.',
    wateringGuide: 'Riego semanal por inmersión de 10 minutos.',
    lightGuide: 'Media sombra con luz tamizada.',
    careTips: [
      'Mantener el musgo húmedo pero sin encharcar.',
      'No mojar las flores directamente.',
      'Proteger de heladas invernales.'
    ]
  },
  {
    id: 'aeonium',
    name: 'Aeonium',
    scientificName: 'Aeonium arboreum',
    origin: 'Islas Canarias',
    light: 'Luz brillante',
    price: 20000,
    categories: ['Todas', 'Color'],
    inStock: true,
    imageUrl: '/images/aeonium.jpg',
    description: 'Magníficas rosetas geométricas semejantes a flores perennes en tonos cobrizos y esmeralda.',
    wateringGuide: 'Cada 10 a 14 días. Menos frecuente en invierno.',
    lightGuide: 'Mucha luz y sol suave para mantener su coloración intensa.',
    careTips: [
      'Tolera sequedad ambiental.',
      'Sumergir cuando el peso sea muy ligero.',
      'Colocar en un plato decorativo con piedritas de soporte.'
    ]
  },
  {
    id: 'mini-romero',
    name: 'Mini Romero',
    scientificName: 'Salvia rosmarinus',
    origin: 'Región mediterránea',
    light: 'Sol directo',
    price: 15000,
    categories: ['Todas', 'Color'],
    inStock: true,
    imageUrl: '/images/mini-romero.jpg',
    description: 'Aromática noble de fragancia leñosa e inconfundible. Aporta frescura verde y utilidad culinaria en tu cocina o ventana.',
    wateringGuide: 'Inmersión cada 7 días. Dejar secar el sustrato entre riegos.',
    lightGuide: 'Sol directo pleno (mínimo 4-5 horas al día).',
    careTips: [
      'Es fundamental que reciba sol y muy buena circulación de aire.',
      'Podar ligeramente las puntas para mantener forma compacta.',
      'Las hojitas podadas se pueden usar frescas o secas para cocinar.'
    ]
  },
  {
    id: 'mini-oregano',
    name: 'Mini Orégano',
    scientificName: 'Origanum vulgare',
    origin: 'Mediterráneo',
    light: 'Sol directo',
    price: 15000,
    categories: ['Todas', 'Color'],
    inStock: true,
    imageUrl: '/images/mini-oregano.jpg',
    description: 'Delicada y perfumada aromática en formato kokedama miniatura. Textura suave e intenso aroma.',
    wateringGuide: 'Inmersión semanal durante 8-10 minutos.',
    lightGuide: 'Pleno sol o alféizar muy soleado.',
    careTips: [
      'Excelente ventilación.',
      'Sumergir solo cuando el musgo esté seco.',
      'Ideal para combinar con la kokedama de romero.'
    ]
  },
  {
    id: 'echeveria',
    name: 'Echeveria',
    scientificName: 'Echeveria elegans',
    origin: 'México',
    light: 'Luz brillante',
    price: 15000,
    categories: ['Todas', 'Color'],
    inStock: true,
    imageUrl: '/images/echeveria.jpg',
    description: 'La clásica "rosa de alabastro". Roseta compacta en tonos verde azulado con suave pruina protectora.',
    wateringGuide: 'Inmersión cada 12-15 días en verano, 20 días en invierno.',
    lightGuide: 'Luz solar indirecta muy brillante o sol filtrado de mañana.',
    careTips: [
      'No mojar el centro de la roseta para evitar hongos.',
      'Regar siempre por absorción inferior sumergiendo la esfera.',
      'Rotar la kokedama cada semana para crecimiento simétrico.'
    ]
  },
  {
    id: 'haworthia',
    name: 'Haworthia',
    scientificName: 'Haworthia fasciata',
    origin: 'Sudáfrica',
    light: 'Luz brillante',
    price: 15000,
    categories: ['Todas', 'Color'],
    inStock: true,
    imageUrl: '/images/haworthia.jpg',
    description: 'Conocida como "planta cebra" por sus franjas blancas en relieve. Estética escultural, muy resistente y perfecta para interiores.',
    wateringGuide: 'Inmersión cada 10 a 14 días.',
    lightGuide: 'Luz natural brillante indirecta. Tolera bien la semisombra.',
    careTips: [
      'Una de las suculentas más agradecidas para departamentos y oficinas.',
      'Excelente drenaje del musgo.',
      'Evitar el sol abrasador del mediodía.'
    ]
  },
  {
    id: 'sedum-burro',
    name: 'Sedum Burro',
    scientificName: 'Sedum morganianum',
    origin: 'México y Honduras',
    light: 'Luz brillante',
    price: 18000,
    categories: ['Todas', 'Colgantes', 'Color'],
    inStock: true,
    imageUrl: '/images/sedum-burro.jpg',
    description: 'Impactante kokedama colgante con tallos carnosos repletos de hojitas globulares verde glauco como racimos.',
    wateringGuide: 'Riego espaciado cada 12 a 15 días.',
    lightGuide: 'Luz brillante con algo de sol suave.',
    careTips: [
      'Colgar en un lugar fijo para no golpear sus delicadas hojitas.',
      'Sumergir despacio con cuidado.',
      'Se multiplica con facilidad mediante las hojitas que puedan caer.'
    ]
  },
  {
    id: 'lazo-de-amor',
    name: 'Lazo de Amor',
    scientificName: 'Chlorophytum comosum',
    origin: 'Sudáfrica',
    light: 'Luz brillante indirecta',
    price: 20000,
    categories: ['Todas', 'Colgantes', 'Sombra'],
    inStock: true,
    imageUrl: '/images/lazo-de-amor.jpg',
    description: 'Planta purificadora del aire por excelencia, conocida también como "cintas" o "malamadre". Hojas arqueadas bicolores y estolones flotantes.',
    wateringGuide: 'Inmersión cada 6 a 8 días.',
    lightGuide: 'Luz indirecta o semisombra. Se adapta a casi cualquier rincón.',
    careTips: [
      'Pulverizar sus hojas en días de mucho calor.',
      'Si las puntas se oscurecen, regar con agua reposada.',
      'Gran generadora de hijuelos colgantes.'
    ]
  },
  {
    id: 'zinnia',
    name: 'Zinnia',
    scientificName: 'Zinnia elegans',
    origin: 'México',
    light: 'Sol directo',
    price: 15000,
    categories: ['Todas', 'Florales', 'Color'],
    inStock: true,
    imageUrl: '/images/zinnia.jpg',
    description: 'Flores multicolores de capas concéntricas muy alegres. Atrae mariposas y polinizadores, ideal para balcones y patios iluminados.',
    wateringGuide: 'Inmersión cada 5 a 7 días. No descuidar en épocas de calor.',
    lightGuide: 'Amante del sol pleno y días luminosos.',
    careTips: [
      'Regar a primera hora de la mañana.',
      'Eliminar flores secas para incentivar nueva floración.',
      'Ubicación exterior o ventana muy soleada.'
    ]
  },
  {
    id: 'souvenir-4-suculentas',
    name: 'Souvenir 4 Suculentas',
    scientificName: 'Echeveria · Haworthia · Jade · Sedum',
    origin: 'México y Sudáfrica',
    light: 'Luz brillante',
    price: 20000,
    categories: ['Todas', 'Color'],
    inStock: true,
    imageUrl: '/images/souvenir-suculentas.jpg',
    description: 'Set artesanal de 4 mini kokedamas seleccionadas con diferentes texturas y colores. La opción más elegida para regalos empresariales, cumpleaños o bodas.',
    wateringGuide: 'Inmersión rápida de 5 minutos cada 12 días.',
    lightGuide: 'Luz brillante a media sombra.',
    careTips: [
      'Incluye tarjeta personalizada de cuidados para agasajados.',
      'Mínimo mantenimiento, máxima duración.',
      'Se pueden ubicar juntas en una bandeja o distribuidas.'
    ]
  },
  {
    id: 'espada-de-san-jorge',
    name: 'Espada de San Jorge',
    scientificName: 'Sansevieria trifasciata',
    origin: 'África tropical',
    light: 'Media sombra / Luz indirecta',
    price: 22000,
    categories: ['Todas', 'Sombra', 'Color'],
    inStock: true,
    imageUrl: '/images/espada-san-jorge.jpg',
    description: 'Hojas erectas y esculturales en tonos verde oscuro con márgenes dorados y jaspeado característico. Montada en esfera de fibra natural; es una de las plantas más resistentes y purificadoras del aire.',
    wateringGuide: 'Riego muy espaciado por inmersión de 10 minutos cada 15 a 20 días. Tolera períodos prolongados de sequedad.',
    lightGuide: 'Muy versátil: prospera tanto con buena luz indirecta como en zonas de sombra o baja iluminación.',
    careTips: [
      'Evitar el exceso de humedad: el sustrato debe secarse por completo entre riegos.',
      'Excelente planta purificadora de ambientes y toxinas en interiores.',
      'Muy noble y de bajísimo mantenimiento, ideal para dormitorios u oficinas.'
    ]
  }
];
