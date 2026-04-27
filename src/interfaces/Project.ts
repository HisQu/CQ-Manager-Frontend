type ProjectReducedT = {
    id: string,
    "name": string,
    "description": string,
    "noManagers": number,
    "noEngineers": number,
    "noGroups": number,
    "noConsolidations": number,
    "totalMembers": number,
};


type ProjectFullT = {
    "id": string,
    "name": string,
    "description": string | null,
    "managers": {
        "email": string,
        "name": string,
        "id": string
    }[],
    "engineers": {
        "email": string,
        "name": string,
        "id": string
    }[],
    "groups": {
        "name": string,
        "members": {
            "email": string,
            "name": string,
            "id": string
        }[],
        "noMembers": number,
        "noQuestions": number,
        "id": string,
        "createdAt": string,
        "updatedAt": string
    }[],
    "consolidations": {
        "name": string,
        "engineer": {
            "email": string,
            "name": string,
            "id": string
        },
        "noQuestions": number,
        "id": string
    }[],
    "noManagers": number,
    "noEngineers": number,
    "noGroups": number,
    "noConsolidations": number,
    "totalMembers": number,
    "createdAt": string,
    "updatedAt": string
}
