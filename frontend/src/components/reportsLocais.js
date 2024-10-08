import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ReportsView = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();  // Hook para navegação

    useEffect(() => {
        const fetchUserIdAndReports = async () => {
            try {
                const token = sessionStorage.getItem('token');

                if (!token) throw new Error('Token de autenticação não encontrado.');

                // Fazendo a solicitação para obter o perfil do usuário autenticado
                const userProfileResponse = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
                    headers: {
                        'x-auth-token': token
                    }
                });

                const userId = userProfileResponse.data.ID_FUNCIONARIO; // ID do usuário
                setUserId(userId);

                // Agora, buscamos os reports para o centro do usuário logado
                fetchReports(userId);
            } catch (error) {
                console.error('Erro ao obter o perfil do usuário:', error);
                setError('Erro ao obter o perfil do usuário.');
            }
        };

        fetchUserIdAndReports();
    }, []);

    const fetchReports = async (userId) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('Token de autenticação não encontrado.');
                return;
            }

            const response = await axios.get(`https://pintfinal-backend.onrender.com/reportlocais/list`, {
                headers: {
                    'x-auth-token': token,
                    'user-id': userId // Inclui o ID do usuário nos cabeçalhos para o filtro no backend
                },
            });

            setReports(response.data);
        } catch (error) {
            console.error('Erro ao carregar reports:', error);
            setError('Erro ao carregar reports.');
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('Token de autenticação não encontrado.');
                return;
            }
    
            // Faz a requisição para deletar o report
            await axios.delete(`https://pintfinal-backend.onrender.com/reportlocais/delete/${id}`, {
                headers: {
                    'x-auth-token': token,
                },
            });
    
            // Atualiza o estado removendo o report excluído da lista de reports
            setReports(reports.filter((report) => report.ID_REPORT !== id));
            setShowModal(false);
    
            // Mostrar mensagem de sucesso usando SweetAlert
            Swal.fire({
                title: 'Sucesso!',
                text: 'O report foi eliminado com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error('Erro ao eliminar o report:', error);
            setError('Erro ao eliminar o report.');
        }
    };

    const handleShowModal = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const handleCardClick = (idLocal) => {
        navigate(`/locais/get/${idLocal}`); // Redireciona para a página do comentário
    };

    return (
        <div className="container mt-5">
            <h1>Reports de Comentários</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
                {reports.map((report) => (
                    <div className="col-md-4" key={report.ID_COMENTARIO}>
                        <Card className="mb-4" onClick={() => handleCardClick(report.comentarioslocal.local.ID_LOCAL)}>
                            <Card.Body>
                            <Card.Text>
                                    <strong>Nome do Local:</strong> {report.comentarioslocal.local.DESIGNACAO_LOCAL}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Comentário:</strong> {report.comentarioslocal.DESCRICAO}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Motivo:</strong> {report.reporttopico.NOME_TOPICO}
                                </Card.Text>
                                <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleShowModal(report); }}>
                                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Modal para confirmar a eliminação do report */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem a certeza que deseja eliminar este report?
                    <br />
                    <strong>Comentário:</strong> {selectedReport?.ComentariosEvento?.DESCRICAO}
                    <br />
                    <strong>Motivo:</strong> {selectedReport?.ReportTopicos?.NOME_TOPICO}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(selectedReport.ID_COMENTARIO)}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReportsView;
