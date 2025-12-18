import os
import subprocess

def install_git_lfs():
    print("Installing Git LFS...")
    subprocess.run(["curl", "-s", "https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh", "|", "bash"], check=True)
    subprocess.run(["apt-get", "install", "-y", "git-lfs"], check=True)
    subprocess.run(["git", "lfs", "install"], check=True)

def pull_lfs_files():
    print("Pulling LFS files...")
    subprocess.run(["git", "lfs", "pull"], check=True)

def main():
    model_path = "model/18_Epoch.pth"
    
    # Check if model file exists
    if not os.path.exists(model_path):
        print("Model not found locally. Installing Git LFS and pulling model...")
        install_git_lfs()
        pull_lfs_files()
    else:
        print("Model found, skipping download.")
    
    # Start the FastAPI app (or other app)
    subprocess.run(["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"])

if __name__ == "__main__":
    main()