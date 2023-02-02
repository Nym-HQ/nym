interface NewsletterProviderBase {
    getSubscribers: () => Promise<any>;
    getSubscriber: ({ email }) => Promise<any>;
    addSubscriber: ({ email, doubleOptIn }) => Promise<any>;
    removeSubscriber: ({ email, doubleOptIn }) => Promise<any>;

    getTemplates: () => Promise<any>;
    addTemplate: ({ subject, body }) => Promise<any>;
    editTemplate: ({ templateId, subject, body }) => Promise<any>;
    removeTemplate: ({ templateId }) => Promise<any>;
    
    send: ({templateId}) => Promise<any>;
};

export default NewsletterProviderBase;