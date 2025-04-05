import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import EndpointDocs from './EndpointDocs';
import { endpointsApi } from '../../utils/api';
import { Endpoint } from '../../types/project';

const EndpointDocsPage: React.FC = () => {
  const { projectId, endpointId } = useParams<{ projectId: string; endpointId: string }>();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        if (!endpointId || !projectId) {
          toast.error('Invalid endpoint or project ID');
          navigate('/');
          return;
        }

        setLoading(true);
        const data = await endpointsApi.getEndpoint(endpointId, projectId);
        setEndpoint(data);
      } catch (error) {
        console.error('Failed to fetch endpoint:', error);
        toast.error('Failed to fetch endpoint details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoint();
  }, [endpointId, projectId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!endpoint || !projectId) {
    return null;
  }

  return <EndpointDocs endpoint={endpoint} projectId={projectId} />;
};

export default EndpointDocsPage;
