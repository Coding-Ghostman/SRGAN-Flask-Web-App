from PIL import Image
import torch
import torchvision.transforms as transforms
import torch.nn as nn


class ResidualBlock(nn.Module):
    def __init__(self, in_features):
        super(ResidualBlock, self).__init__()
        self.conv_block = nn.Sequential(
            nn.Conv2d(in_features, in_features,
                      kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(in_features, 0.8),
            nn.PReLU(),
            nn.Conv2d(in_features, in_features,
                      kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(in_features, 0.8),
        )

    def forward(self, x):
        return x + self.conv_block(x)


class Generator(nn.Module):
    def __init__(self, in_channels=3, out_channels=3, n_residual_blocks=16):
        super(Generator, self).__init__()

        # First layer
        self.conv1 = nn.Sequential(
            nn.Conv2d(in_channels, 64, kernel_size=9, stride=1, padding=4), nn.PReLU())

        # Residual blocks
        res_blocks = []
        for _ in range(n_residual_blocks):
            res_blocks.append(ResidualBlock(64))
        self.res_blocks = nn.Sequential(*res_blocks)

        # Second conv layer post residual blocks
        self.conv2 = nn.Sequential(
            nn.Conv2d(64, 64, kernel_size=3, stride=1, padding=1), nn.BatchNorm2d(64, 0.8))

        # Upsampling layers
        upsampling = []
        for out_features in range(2):
            upsampling += [
                # nn.Upsample(scale_factor=2),
                nn.Conv2d(64, 256, 3, 1, 1),
                nn.BatchNorm2d(256),
                nn.PixelShuffle(upscale_factor=2),
                nn.PReLU(),
            ]
        self.upsampling = nn.Sequential(*upsampling)

        # Final output layer
        self.conv3 = nn.Sequential(
            nn.Conv2d(64, out_channels, kernel_size=9, stride=1, padding=4), nn.Tanh())

    def forward(self, x):
        out1 = self.conv1(x)
        out = self.res_blocks(out1)
        out2 = self.conv2(out)
        out = torch.add(out1, out2)
        out = self.upsampling(out)
        out = self.conv3(out)
        return out


model = Generator()
model.load_state_dict(torch.load(
    '../models/generator_model_epoch_35.pth', map_location=torch.device('cpu')))
model.eval()

def output(image_file):
    input_image = image_file.convert('RGB')

    transform = transforms.Compose([
                transforms.Resize((64, 64)),
                transforms.ToTensor(),
            ])
    input_tensor = transform(input_image).unsqueeze(0)

    with torch.no_grad():
        output_tensor = model(input_tensor)

    output_image = output_tensor.squeeze().clamp(0, 1).cpu().numpy()
    output_image = (output_image * 255).astype('uint8')
    output_image = Image.fromarray(output_image.transpose(1, 2, 0), 'RGB')
    output_image.save("sv.png")

    lr_image = Image.fromarray((((transform(input_image).clamp(
            0, 1).cpu().numpy()) * 255).astype('uint8')).transpose(1, 2, 0), 'RGB')

    lr_image.save("lr.png")
    return output_image