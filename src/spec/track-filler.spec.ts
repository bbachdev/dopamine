import * as assert from 'assert';
import { IMock, Mock } from 'typemoq';
import { FileSystem } from '../app/core/io/file-system';
import { Logger } from '../app/core/logger';
import { Track } from '../app/data/entities/track';
import { FileMetadata } from '../app/metadata/file-metadata';
import { FileMetadataFactory } from '../app/metadata/file-metadata-factory';
import { TrackFiller } from '../app/services/indexing/track-filler';
import { FileMetadataMock } from './mocking/file-metadata-mock';

describe('TrackFiller', () => {
    describe('addFileMetadataToTrackAsync', () => {
        function createTrackFiller(fileMetadata: FileMetadata): TrackFiller {
            const fileMetadataFactoryMock: IMock<FileMetadataFactory> = Mock.ofType<FileMetadataFactory>();
            const fileSystemMock: IMock<FileSystem> = Mock.ofType<FileSystem>();
            const loggerMock: IMock<Logger> = Mock.ofType<Logger>();

            fileMetadataFactoryMock.setup(
                x => x.createReadOnlyAsync('/home/user/Music/Track 1.mp3')
            ).returns(async () => fileMetadata);

            fileSystemMock.setup(x => x.getFileName('/home/user/Music/Track 1.mp3')).returns(() => 'Track 1');
            fileSystemMock.setup(x => x.getFileExtension('/home/user/Music/Track 1.mp3')).returns(() => '.mp3');
            fileSystemMock.setup(x => x.getFilesizeInBytes('/home/user/Music/Track 1.mp3')).returns(() => 123);
            fileSystemMock.setup(x => x.getDateCreatedInTicksAsync('/home/user/Music/Track 1.mp3')).returns(async () => 456);
            fileSystemMock.setup(x => x.getDateModifiedInTicksAsync('/home/user/Music/Track 1.mp3')).returns(async () => 789);

            const trackFiller: TrackFiller = new TrackFiller(
                fileMetadataFactoryMock.object,
                fileSystemMock.object,
                loggerMock.object
            );

            return trackFiller;
        }

        it('Should fill in empty artists if artists metadata is null', async () => {
            // Arrange
            const fileMetadataMock: FileMetadataMock = new FileMetadataMock();
            fileMetadataMock.artists = null;

            const trackFiller: TrackFiller = createTrackFiller(fileMetadataMock);

            // Act
            const track: Track = new Track('/home/user/Music/Track 1.mp3');
            await trackFiller.addFileMetadataToTrackAsync(track);

            // Assert
            assert.strictEqual(track.artists, '');
        });

        it('Should fill in empty artists if artists metadata is undefined', async () => {
            // Arrange
            const fileMetadataMock: FileMetadataMock = new FileMetadataMock();
            fileMetadataMock.artists = undefined;

            const trackFiller: TrackFiller = createTrackFiller(fileMetadataMock);

            // Act
            const track: Track = new Track('/home/user/Music/Track 1.mp3');
            await trackFiller.addFileMetadataToTrackAsync(track);

            // Assert
            assert.strictEqual(track.artists, '');
        });

        it('Should fill in empty artists if artists metadata is empty', async () => {
            // Arrange
            const fileMetadataMock: FileMetadataMock = new FileMetadataMock();
            fileMetadataMock.artists = [];

            const trackFiller: TrackFiller = createTrackFiller(fileMetadataMock);

            // Act
            const track: Track = new Track('/home/user/Music/Track 1.mp3');
            await trackFiller.addFileMetadataToTrackAsync(track);

            // Assert
            assert.strictEqual(track.artists, '');
        });

        it('Should fill in a single artist if artists metadata has single artist', async () => {
            // Arrange
            const fileMetadataMock: FileMetadataMock = new FileMetadataMock();
            fileMetadataMock.artists = ['Artist 1'];

            const trackFiller: TrackFiller = createTrackFiller(fileMetadataMock);

            // Act
            const track: Track = new Track('/home/user/Music/Track 1.mp3');
            await trackFiller.addFileMetadataToTrackAsync(track);

            // Assert
            assert.strictEqual(track.artists, ';Artist 1;');
        });

        it('Should fill in multiple artists if artists metadata has multiple artists', async () => {
            // Arrange
            const fileMetadataMock: FileMetadataMock = new FileMetadataMock();
            fileMetadataMock.artists = ['Artist 1', 'Artist 2'];

            const trackFiller: TrackFiller = createTrackFiller(fileMetadataMock);

            // Act
            const track: Track = new Track('/home/user/Music/Track 1.mp3');
            await trackFiller.addFileMetadataToTrackAsync(track);

            // Assert
            assert.strictEqual(track.artists, ';Artist 1;;Artist 2;');
        });
    });
});
