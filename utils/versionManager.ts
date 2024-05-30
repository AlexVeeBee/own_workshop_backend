class VersionManager {
    static instance: VersionManager;
    private version: string;

    private constructor() {
        this.version = 'unknown';
    }
}