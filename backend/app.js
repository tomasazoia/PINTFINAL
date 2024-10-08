const express = require('express');
//const Sequelize = require('sequelize');
const cors = require('cors');
const app = express();
const session = require('express-session');
const { SESSION_SECRET, PORT } = require('./src/config');
const sequelize = require('./src/models/database');
const multer = require('multer');
const path = require('path');

const loginRoutes = require('./src/routes/loginRoute');
const centroRoutes = require('./src/routes/centroRoute');
const eventoRoutes = require('./src/routes/eventosRoute');
const locaisRoutes = require('./src/routes/locaisRoute');
const forumRoutes = require('./src/routes/forumRoute');
const albumRoutes = require('./src/routes/albumFotosRoute');
const userRoutes = require('./src/routes/utilizadorRoute');
const areaRoutes = require('./src/routes/areaRoute');
const participantesEventoRoutes = require('./src/routes/participantesEventoRoute');
const settingsRoutes = require('./src/routes/settingsRoute');
const comentarios_ForumRoutes = require('./src/routes/comentarios_forumRoute');
const reportTopicosRoutes = require('./src/routes/reportTopicosRoute');
const reportEventosRoutes = require('./src/routes/reportEventosRoute');
const reportForumsRoutes = require('./src/routes/reportForumsRoute');
const reportLocaisRoutes = require('./src/routes/reportLocaisRoute');
const comentarios = require('./src/routes/comentarios_eventoRoute');
const subareas = require('./src/routes/subAreaRoute');
const userPreferences = require('./src/routes/userPreferencesRoute');
const review = require('./src/routes/reviewRoutes');
const comentarioLocal = require('./src/routes/comentarios_localRoute');
const notificacoes = require('./src/routes/notificacoesRoute');
const formularios = require('./src/routes/formulariosRoute');
const infos = require('./src/routes/infosEAvisosRoute');
const reviewComentariosEventoRoutes = require('./src/routes/review_comentarios_eventoRoute');
const reviewComentariosForumRoutes = require('./src/routes/review_comentarios_forumRoute');
const reviewComentariosLocalRoutes = require('./src/routes/review_comentarios_localRoute');

const AlbumFotos = require('./src/models/albumFotos');
const Area = require('./src/models/area');
const AreaLocal = require('./src/models/areaLocal');
const Centro = require('./src/models/centro');
const Comentarios_Evento = require('./src/models/comentarios_evento');
const Comentarios_Forum = require('./src/models/comentarios_forum');
const Eventos = require('./src/models/eventos');
const Forum = require('./src/models/forum');
//const Fotos = require('./src/models/fotos');
const Locais = require('./src/models/locais');
const SubArea = require('./src/models/subArea');
const users = require('./src/models/users');
const ParticipantesEvento = require('./src/models/participantes_evento');
const Formularios = require('./src/models/formularios');
const reportTopicos = require('./src/models/reportTopicos');
const reportEventos = require('./src/models/reportEventos');
const reportLocais = require('./src/models/reportLocais');
const reportForums = require('./src/models/reportForums');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

const predefinedAreas = [
  { NOME_AREA: 'Gastronomia' },
  { NOME_AREA: 'Desporto' },
  { NOME_AREA: 'Saúde' },
  { NOME_AREA: 'Formação' },
  { NOME_AREA: 'Habitação' },
  { NOME_AREA: 'Transportes' },
  { NOME_AREA: 'Lazer' }
];

const predefinedCentros = [
  { NOME_CENTRO: 'Centro de Viseu', MORADA: 'VISEU', N_EVENTOS: 0 },
  { NOME_CENTRO: 'Centro de Tomar', MORADA: ' TOMAR', N_EVENTOS: 0 },
  { NOME_CENTRO: 'Centro de Fundao', MORADA: 'FUNDAO', N_EVENTOS: 0 },
  { NOME_CENTRO: 'Centro de Portalegre', MORADA: 'PORTALEGRE', N_EVENTOS: 0 },
  { NOME_CENTRO: 'Centro de Vila Real', MORADA: 'VILA REAL', N_EVENTOS: 0 }
];

const predefinedFormularios = [
  { ID_FORMULARIO: 1, NOME_FORMULARIO: 'Criar_Conta', ATIVO: true },
  { ID_FORMULARIO: 2, NOME_FORMULARIO: 'Criar_Evento', ATIVO: true },
  { ID_FORMULARIO: 3, NOME_FORMULARIO: 'Criar_Estabelecimento', ATIVO: true }
];

const predefinedTopicosReport = [
  { NOME_TOPICO: 'Spam'},
  { NOME_TOPICO: 'Ódio ou Discriminação'},
  { NOME_TOPICO: 'Conteúdo Inapropriado'},
  { NOME_TOPICO: 'Assédio' },
  { NOME_TOPICO: 'Duplicado' },
  { NOME_TOPICO: 'Informação Falsa' }
];

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');
    await sequelize.sync();

    // Sincronizar áreas
    for (const area of predefinedAreas) {
      const [areaInstance, created] = await Area.findOrCreate({
        where: { NOME_AREA: area.NOME_AREA },
        defaults: area
      });
      if (created) {
        console.log(`Área "${area.NOME_AREA}" criada`);
      } else {
        console.log(`Área "${area.NOME_AREA}" já existe`);
      }
    }

    // Sincronizar centros
    for (const centro of predefinedCentros) {
      const [centroInstance, created] = await Centro.findOrCreate({
        where: { NOME_CENTRO: centro.NOME_CENTRO },
        defaults: centro
      });
      if (created) {
        console.log(`Centro "${centro.NOME_CENTRO}" criado`);
      } else {
        console.log(`Centro "${centro.NOME_CENTRO}" já existe`);
      }
    }

    // Sincronizar formularios
    for (const formulario of predefinedFormularios) {
      const [formInstance, created] = await Formularios.findOrCreate({
        where: { ID_FORMULARIO: formulario.ID_FORMULARIO },
        defaults: formulario
      });
      if (created) {
        console.log(`Formulário "${formInstance.NOME_FORMULARIO}" criado`);
      } else {
        console.log(`Formulário "${formInstance.NOME_FORMULARIO}" já existe`);
      }
    }

    // Sincronizar topicos de report
    for (const topico of predefinedTopicosReport) {
      const [topicoInstance, created] = await reportTopicos.findOrCreate({
        where: { NOME_TOPICO: topico.NOME_TOPICO },
        defaults: topico
      });
      if (created) {
        console.log(`Tópico de report "${topicoInstance.NOME_TOPICO}" criado`);
      } else {
        console.log(`Tópico de report "${topicoInstance.NOME_TOPICO}" já existe`);
      }
    }


    console.log('Todos os modelos foram sincronizados com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
};

app.post('/upload', upload.single('foto'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  console.log(req.file); 
  res.send('Arquivo recebido com sucesso');
})

app.use('/auth', loginRoutes);
app.use('/centro', centroRoutes);
app.use('/evento', eventoRoutes);
app.use('/locais', locaisRoutes);
app.use('/forum', forumRoutes);
app.use('/album', albumRoutes);
app.use('/user', userRoutes);
app.use('/area', areaRoutes);
app.use('/participantesevento', participantesEventoRoutes);
app.use('/comentarios_forum', comentarios_ForumRoutes);
app.use('/comentarios_evento', comentarios);
app.use('/subarea', subareas);
app.use('/userpreferences', userPreferences);
app.use('/review', review);
app.use('/comentarios_local', comentarioLocal);
app.use('/notificacoes', notificacoes);
app.use('/formularios', formularios);
app.use('/reporttopicos', reportTopicosRoutes);
app.use('/reporteventos', reportEventosRoutes);
app.use('/reportforums', reportForumsRoutes);
app.use('/reportlocais', reportLocaisRoutes);
app.use('/infos', infos);
app.use('/reviews_comentarios_evento', reviewComentariosEventoRoutes);
app.use('/reviews_comentarios_forum', reviewComentariosForumRoutes);
app.use('/reviews_comentarios_local', reviewComentariosLocalRoutes);

syncDatabase();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
