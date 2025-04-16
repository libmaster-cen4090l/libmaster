// src/components/common/AmenityTag.tsx

export type AmenityType = 'whiteboard' | 'monitor' | 'window' | 'grad_only' | 'approval_req';

interface AmenityTagProps {
  type: AmenityType;
  className?: string;
}

const AmenityTag: React.FC<AmenityTagProps> = ({ type, className = '' }) => {
  // define styling and label based on amenity type
  const getAmenityConfig = (): { className: string; label: string } => {
    switch (type) {
      case 'whiteboard':
        return { className: 'bg-blue-100 text-blue-800', label: 'Whiteboard' };
      case 'monitor':
        return { className: 'bg-purple-100 text-purple-800', label: 'Monitor' };
      case 'window':
        return { className: 'bg-yellow-100 text-yellow-800', label: 'Window' };
      case 'grad_only':
        return { className: 'bg-indigo-100 text-indigo-800', label: 'Grad Only' };
      case 'approval_req':
        return { className: 'bg-amber-100 text-amber-800', label: 'Approval Req.' };
      default:
        return { className: 'bg-gray-100 text-gray-800', label: type };
    }
  };

  const { className: tagClassName, label } = getAmenityConfig();

  return (
    <span className={`shadow px-2 py-1 rounded ${tagClassName} ${className}`}>
        {label}
    </span>
  );
};

export default AmenityTag;
