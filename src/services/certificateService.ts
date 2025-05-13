interface Certificate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badgesRequired: {
    badge: {
      id: string;
      title: string;
      imageUrl: string;
    }
  }[];
  eligible?: boolean;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

// Get all certificates with eligibility information
export async function getAllCertificates(): Promise<{ certificates: Certificate[] } | { error: string }> {
  try {
    const response = await fetch('/api/certificates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to fetch certificates' };
    }

    const certificates = await response.json();
    return { certificates };
  } catch (error) {
    console.error('Get certificates error:', error);
    return { error: 'An unexpected error occurred while fetching certificates' };
  }
}

// Create a new certificate (admin only)
export async function createCertificate(certificate: Partial<Certificate>): Promise<{ certificate: Certificate } | { error: string }> {
  try {
    const response = await fetch('/api/certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(certificate),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to create certificate' };
    }

    const createdCertificate = await response.json();
    return { certificate: createdCertificate };
  } catch (error) {
    console.error('Create certificate error:', error);
    return { error: 'An unexpected error occurred while creating the certificate' };
  }
} 