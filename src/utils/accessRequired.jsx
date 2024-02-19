import { useContext } from 'react';
import { hasAccess } from './accessHelper';
import { AuthContext } from '../contexts';
import UnAuthorized from './unAuthorized';

function AccessRequired({ children, module }) {
    const { user } = useContext(AuthContext)
    if (user.role == "superAdmin") {
        return children
    }else {
        if (hasAccess(module)) {
            return children;
        } else {
            return <UnAuthorized />;
        }
    }
}

export default AccessRequired;
